package com.its.userservice.exception;

import com.fasterxml.jackson.core.JsonLocation;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Turns exceptions thrown anywhere in the controllers/services into
 * consistent {@link ApiError} JSON responses with the right HTTP status.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleDuplicate(DuplicateResourceException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex,
                                                             HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiError> handleInvalidRequest(InvalidRequestException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    /** Another microservice (called via Feign or RestTemplate) could not be reached. */
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<ApiError> handleServiceUnavailable(ServiceUnavailableException ex,
                                                             HttpServletRequest request) {
        return build(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request);
    }

    /** Bean Validation failures on @Valid request bodies - lists every invalid field. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            // keep the first message per field
            fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ApiError body = ApiError.withFieldErrors(status.value(), status.getReasonPhrase(),
                "Validation failed", request.getRequestURI(), fieldErrors);
        return ResponseEntity.status(status).body(body);
    }

    /** Missing or malformed JSON, an unknown role, or a value of the wrong type. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, describeUnreadable(ex), request);
    }

    /** A path variable of the wrong type, e.g. /api/users/abc. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                       HttpServletRequest request) {
        String message = "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'";
        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    /** Database constraint violation, e.g. two requests registering the same email at once. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex,
                                                        HttpServletRequest request) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.CONFLICT, "The request conflicts with existing data", request);
    }

    /**
     * Fallback. Spring's own web exceptions (unknown URL, wrong HTTP method,
     * unsupported content type, ...) keep their proper status code;
     * anything else is an unexpected server error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOther(Exception ex, HttpServletRequest request) {
        if (ex instanceof ErrorResponse errorResponse) {
            HttpStatusCode statusCode = errorResponse.getStatusCode();
            HttpStatus status = HttpStatus.resolve(statusCode.value());
            String reason = status != null ? status.getReasonPhrase() : "Error";
            ApiError body = ApiError.of(statusCode.value(), reason, ex.getMessage(), request.getRequestURI());
            return ResponseEntity.status(statusCode).body(body);
        }
        log.error("Unexpected error on {}", request.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
    }

    // ----------------------------------------------------------------- helpers

    /**
     * Explains why the JSON body could not be read, as precisely as possible:
     * <ul>
     *   <li>unknown role - "Invalid role 'admin'. Allowed values: productOwner, assignee"</li>
     *   <li>broken JSON (missing quote, comma, ...) - "Malformed JSON at line 2, column 22"</li>
     *   <li>wrong value type - "Invalid value 'abc' for field 'userId'"</li>
     * </ul>
     */
    static String describeUnreadable(HttpMessageNotReadableException ex) {
        Throwable root = ex.getMostSpecificCause();
        if (root instanceof IllegalArgumentException && !(root instanceof NumberFormatException)) {
            return root.getMessage(); // thrown by our own code, e.g. Role.fromValue
        }
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException invalidFormat) {
            return "Invalid value '" + invalidFormat.getValue() + "' for field '" + fieldPath(invalidFormat) + "'";
        }
        if (cause instanceof MismatchedInputException mismatch && !mismatch.getPath().isEmpty()) {
            return "Invalid value for field '" + fieldPath(mismatch) + "'";
        }
        if (cause instanceof JsonParseException parseError && parseError.getLocation() != null) {
            JsonLocation location = parseError.getLocation();
            return "Malformed JSON at line " + location.getLineNr() + ", column " + location.getColumnNr()
                    + " - check for a missing quote, comma or bracket";
        }
        return "Request body is missing or malformed";
    }

    /** "email", or "items.[0].name" for nested fields. */
    private static String fieldPath(JsonMappingException ex) {
        return ex.getPath().stream()
                .map(ref -> ref.getFieldName() != null ? ref.getFieldName() : "[" + ref.getIndex() + "]")
                .collect(Collectors.joining("."));
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest request) {
        ApiError body = ApiError.of(status.value(), status.getReasonPhrase(), message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
