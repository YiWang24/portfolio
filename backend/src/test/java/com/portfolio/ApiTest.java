package com.portfolio;


import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ApiTest {

    @Autowired
    private MockMvc mockMvc;

    private static String sessionId;



    @Test
    @Order(1)
    void testMessageEndpoint() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/chat/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\": \"你好\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").exists())
                .andExpect(jsonPath("$.response").exists())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        System.out.println("[POST /message] " + response);
        
        // 保存 sessionId 供后续测试使用
        sessionId = response.split("\"sessionId\":\"")[1].split("\"")[0];
    }

    @Test
    @Order(2)
    void testMessageWithSession() throws Exception {
        Assumptions.assumeTrue(sessionId != null, "需要先运行 testMessageEndpoint");
        
        MvcResult result = mockMvc.perform(post("/api/v1/chat/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"sessionId\": \"" + sessionId + "\", \"message\": \"你叫什么名字？\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(sessionId))
                .andReturn();

        System.out.println("[POST /message with session] " + result.getResponse().getContentAsString());
    }

    @Test
    @Order(3)
    void testStreamEndpoint() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/chat/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\": \"简单介绍一下你自己\"}"))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        System.out.println("[POST /stream] " + response.substring(0, Math.min(200, response.length())) + "...");
    }

    @Test
    @Order(4)
    void testDeleteSession() throws Exception {
        Assumptions.assumeTrue(sessionId != null, "需要先运行 testMessageEndpoint");
        
        mockMvc.perform(delete("/api/v1/chat/session/" + sessionId))
                .andExpect(status().isOk());

        System.out.println("[DELETE /session] sessionId=" + sessionId + " 已清除");
    }

    @Test
    @Order(5)
    void testInvalidRequest() throws Exception {
        mockMvc.perform(post("/api/v1/chat/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk()); // 空消息也应该能处理
    }
}
