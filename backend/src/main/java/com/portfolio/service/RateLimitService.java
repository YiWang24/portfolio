package com.portfolio.service;

import com.portfolio.config.EnvConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class RateLimitService {
    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);
    private final boolean enabled;
    private final int globalDaily, globalHourly, ipDaily, ipHourly;
    private final Map<String, SlidingWindow> ipHourlyMap = new ConcurrentHashMap<>();
    private final Map<String, SlidingWindow> ipDailyMap = new ConcurrentHashMap<>();
    private final SlidingWindow globalHourlyWindow = new SlidingWindow();
    private final SlidingWindow globalDailyWindow = new SlidingWindow();

    public RateLimitService() {
        this.enabled = Boolean.parseBoolean(EnvConfig.get("RATE_LIMIT_ENABLED", "true"));
        this.globalDaily = Integer.parseInt(EnvConfig.get("RATE_LIMIT_GLOBAL_DAILY", "1000"));
        this.globalHourly = Integer.parseInt(EnvConfig.get("RATE_LIMIT_GLOBAL_HOURLY", "100"));
        this.ipDaily = Integer.parseInt(EnvConfig.get("RATE_LIMIT_IP_DAILY", "50"));
        this.ipHourly = Integer.parseInt(EnvConfig.get("RATE_LIMIT_IP_HOURLY", "10"));
        log.info("RateLimitService: enabled={}, global={}/{}, ip={}/{} (sliding window)", 
                enabled, globalHourly, globalDaily, ipHourly, ipDaily);
    }

    public boolean allowRequest(String ip) {
        if (!enabled) return true;
        long now = Instant.now().getEpochSecond();
        
        if (globalHourlyWindow.getCount(now, 3600) >= globalHourly) {
            log.warn("Global hourly limit exceeded");
            return false;
        }
        if (globalDailyWindow.getCount(now, 86400) >= globalDaily) {
            log.warn("Global daily limit exceeded");
            return false;
        }
        
        SlidingWindow ipH = ipHourlyMap.computeIfAbsent(ip, k -> new SlidingWindow());
        SlidingWindow ipD = ipDailyMap.computeIfAbsent(ip, k -> new SlidingWindow());
        
        if (ipH.getCount(now, 3600) >= this.ipHourly) {
            log.warn("IP {} hourly limit exceeded", ip);
            return false;
        }
        if (ipD.getCount(now, 86400) >= this.ipDaily) {
            log.warn("IP {} daily limit exceeded", ip);
            return false;
        }
        
        globalHourlyWindow.add(now);
        globalDailyWindow.add(now);
        ipH.add(now);
        ipD.add(now);
        return true;
    }

    public Map<String, Object> getStats() {
        long now = Instant.now().getEpochSecond();
        return Map.of(
            "enabled", enabled,
            "globalHourly", globalHourlyWindow.getCount(now, 3600) + "/" + globalHourly,
            "globalDaily", globalDailyWindow.getCount(now, 86400) + "/" + globalDaily,
            "uniqueIPs", ipHourlyMap.size()
        );
    }

    private static class SlidingWindow {
        private final Queue<Long> timestamps = new ConcurrentLinkedQueue<>();
        
        synchronized void add(long timestamp) {
            timestamps.offer(timestamp);
        }
        
        synchronized int getCount(long now, long windowSeconds) {
            long cutoff = now - windowSeconds;
            timestamps.removeIf(ts -> ts < cutoff);
            return timestamps.size();
        }
    }
}
