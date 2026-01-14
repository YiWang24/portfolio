package com.portfolio.service;

import com.portfolio.config.EnvConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {
    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);
    private final boolean enabled;
    private final int globalDaily, globalHourly, ipDaily, ipHourly;
    private final Map<String, Counter> ipHourlyMap = new ConcurrentHashMap<>();
    private final Map<String, Counter> ipDailyMap = new ConcurrentHashMap<>();
    private final Counter globalHourlyCounter = new Counter();
    private final Counter globalDailyCounter = new Counter();

    public RateLimitService() {
        this.enabled = Boolean.parseBoolean(EnvConfig.get("RATE_LIMIT_ENABLED", "true"));
        this.globalDaily = Integer.parseInt(EnvConfig.get("RATE_LIMIT_GLOBAL_DAILY", "1000"));
        this.globalHourly = Integer.parseInt(EnvConfig.get("RATE_LIMIT_GLOBAL_HOURLY", "100"));
        this.ipDaily = Integer.parseInt(EnvConfig.get("RATE_LIMIT_IP_DAILY", "50"));
        this.ipHourly = Integer.parseInt(EnvConfig.get("RATE_LIMIT_IP_HOURLY", "10"));
        log.info("RateLimitService: enabled={}, global={}/{}, ip={}/{}", enabled, globalHourly, globalDaily, ipHourly, ipDaily);
    }

    public boolean allowRequest(String ip) {
        if (!enabled) return true;
        LocalDateTime now = LocalDateTime.now();
        if (!checkLimit(globalHourlyCounter, globalHourly, now, ChronoUnit.HOURS)) {
            log.warn("Global hourly limit exceeded");
            return false;
        }
        if (!checkLimit(globalDailyCounter, globalDaily, now, ChronoUnit.DAYS)) {
            log.warn("Global daily limit exceeded");
            return false;
        }
        Counter ipH = ipHourlyMap.computeIfAbsent(ip, k -> new Counter());
        Counter ipD = ipDailyMap.computeIfAbsent(ip, k -> new Counter());
        if (!checkLimit(ipH, this.ipHourly, now, ChronoUnit.HOURS)) {
            log.warn("IP {} hourly limit exceeded", ip);
            return false;
        }
        if (!checkLimit(ipD, this.ipDaily, now, ChronoUnit.DAYS)) {
            log.warn("IP {} daily limit exceeded", ip);
            return false;
        }
        globalHourlyCounter.increment(now);
        globalDailyCounter.increment(now);
        ipH.increment(now);
        ipD.increment(now);
        return true;
    }

    private boolean checkLimit(Counter counter, int limit, LocalDateTime now, ChronoUnit unit) {
        counter.cleanup(now, unit);
        return counter.getCount() < limit;
    }

    public Map<String, Object> getStats() {
        return Map.of("enabled", enabled, "globalHourly", globalHourlyCounter.getCount() + "/" + globalHourly,
            "globalDaily", globalDailyCounter.getCount() + "/" + globalDaily, "uniqueIPs", ipHourlyMap.size());
    }

    private static class Counter {
        private int count = 0;
        private LocalDateTime windowStart = LocalDateTime.now();
        synchronized void increment(LocalDateTime now) { count++; }
        synchronized void cleanup(LocalDateTime now, ChronoUnit unit) {
            if (unit.between(windowStart, now) >= 1) { count = 0; windowStart = now; }
        }
        synchronized int getCount() { return count; }
    }
}
