package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SendChatMessageRequest {
    private String message;
    private Boolean publicMessage = false;
    
    // Explicit getters and setters in case Lombok isn't working correctly
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Boolean getPublicMessage() {
        return publicMessage != null ? publicMessage : false;
    }
    
    public void setPublicMessage(Boolean publicMessage) {
        this.publicMessage = publicMessage;
    }
}
