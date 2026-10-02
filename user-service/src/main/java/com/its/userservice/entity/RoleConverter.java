package com.its.userservice.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Maps {@link Role} to the values stored in the MySQL ENUM column
 * ('productOwner', 'assignee') and back.
 */
@Converter
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        return role == null ? null : role.getValue();
    }

    @Override
    public Role convertToEntityAttribute(String dbValue) {
        return dbValue == null ? null : Role.fromValue(dbValue);
    }
}
