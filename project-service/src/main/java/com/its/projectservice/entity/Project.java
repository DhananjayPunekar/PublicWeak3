package com.its.projectservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * JPA entity for the {@code projects} table in project_db.
 */
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "project_name", nullable = false, unique = true)
    private String projectName;

    /**
     * User ID of the product owner. The user lives in user-service's database,
     * so this is a plain ID, not a JPA relationship.
     */
    @Column(name = "product_owner", nullable = false)
    private Integer productOwner;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** Required by JPA. */
    public Project() {
    }

    public Project(String projectName, Integer productOwner, LocalDate startDate, LocalDate endDate) {
        this.projectName = projectName;
        this.productOwner = productOwner;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Integer getProductOwner() {
        return productOwner;
    }

    public void setProductOwner(Integer productOwner) {
        this.productOwner = productOwner;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
