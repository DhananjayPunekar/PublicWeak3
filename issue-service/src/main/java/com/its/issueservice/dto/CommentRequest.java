package com.its.issueservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for adding or editing a comment on an issue.
 */
public record CommentRequest(

        @Schema(example = "Reproduced on Chrome and Edge")
        @NotBlank(message = "Comment text is required")
        @Size(max = 5000, message = "Comment must be at most 5000 characters")
        String text
) {
}
