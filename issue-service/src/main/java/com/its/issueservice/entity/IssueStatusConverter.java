package com.its.issueservice.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Maps {@link IssueStatus} to the values stored in the MySQL ENUM column
 * ('TO DO', 'DEVELOPMENT', 'TESTING', 'COMPLETED') and back. Needed because
 * 'TO DO' contains a space, so it can't be a Java enum constant name.
 */
@Converter
public class IssueStatusConverter implements AttributeConverter<IssueStatus, String> {

    @Override
    public String convertToDatabaseColumn(IssueStatus status) {
        return status == null ? null : status.getValue();
    }

    @Override
    public IssueStatus convertToEntityAttribute(String dbValue) {
        return dbValue == null ? null : IssueStatus.fromValue(dbValue);
    }
}
