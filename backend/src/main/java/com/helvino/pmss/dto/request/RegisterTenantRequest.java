package com.helvino.pmss.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterTenantRequest {
    @NotBlank private String pharmacyName;
    @NotBlank private String ownerName;
    @NotBlank private String phone;
    @NotBlank @Email private String email;
    private String kraPin;
    private String physicalAddress;
    private String licenseNumber;
    @NotBlank private String password;
}
