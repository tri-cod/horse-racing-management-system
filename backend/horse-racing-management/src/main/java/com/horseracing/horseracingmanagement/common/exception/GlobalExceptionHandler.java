package com.horseracing.horseracingmanagement.common.exception;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Catches exceptions thrown from controllers/services and returns them in the standard
 * ApiResponse format.
 * <p>
 * Each handler reports the exact problem that occurred: which field failed, what value was
 * rejected, and what was expected. Only the catch-all handler stays generic, because an
 * unexpected internal failure has nothing useful (and nothing safe) to tell the user.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Maps database unique/foreign-key constraint names to a message the user can act on.
     * Replace these with the real constraint names from your schema.
     */
    private static final Map<String, String> CONSTRAINT_MESSAGES = Map.of(
            "uk_users_username", "This username is already taken.",
            "uk_users_email", "This email address is already registered.",
            "uk_users_phone", "This phone number is already registered.",
            "uk_horses_name", "A horse with this name already exists.",
            "fk_horses_owner", "The selected owner no longer exists."
    );

    /** Friendly type names, used when reporting a type mismatch. */
    private static final Map<Class<?>, String> TYPE_NAMES = Map.of(
            Integer.class, "whole number",
            Long.class, "whole number",
            Double.class, "number",
            BigDecimal.class, "number",
            Boolean.class, "true/false value",
            LocalDate.class, "date (format: yyyy-MM-dd)",
            LocalDateTime.class, "date and time (format: yyyy-MM-ddTHH:mm:ss)",
            LocalTime.class, "time (format: HH:mm:ss)"
    );

    // 1) @Valid failures on @RequestBody.
    //    The message comes straight from the annotation on the DTO, e.g.
    //    @Size(min = 2, max = 150, message = "Horse name must be between 2 and 150 characters")
    //    -> message: "Horse name must be between 2 and 150 characters"
    //       errors:  { "name": "Horse name must be between 2 and 150 characters" }
    //    Write every DTO message as a complete sentence naming its own field, and it will
    //    reach the user exactly as written.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new LinkedHashMap<>();
        List<String> summaries = new ArrayList<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            String message = messageOf(fieldError.getDefaultMessage(), fieldError.getField());
            // Keep the first error per field so the FE gets one message per input box
            if (errors.putIfAbsent(fieldError.getField(), message) == null) {
                summaries.add(message);
            }
        }
        // Class-level rules, e.g. @PasswordMatches on the DTO
        for (ObjectError globalError : ex.getBindingResult().getGlobalErrors()) {
            String message = messageOf(globalError.getDefaultMessage(), globalError.getObjectName());
            errors.put(globalError.getObjectName(), message);
            summaries.add(message);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(joinSentences(summaries), errors));
    }

    // 2) Validation on @RequestParam / @PathVariable (@Validated on the controller class)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleConstraintViolation(
            ConstraintViolationException ex) {

        Map<String, String> errors = new LinkedHashMap<>();
        List<String> summaries = new ArrayList<>();

        ex.getConstraintViolations().forEach(violation -> {
            // "createHorse.arg0.name" -> "name"
            String field = lastSegment(violation.getPropertyPath().toString());
            String message = messageOf(violation.getMessage(), field);
            if (errors.putIfAbsent(field, message) == null) {
                summaries.add(message);
            }
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(joinSentences(summaries), errors));
    }

    // 3) Malformed / missing JSON body — dig into the Jackson cause to name the offending field
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadableBody(HttpMessageNotReadableException ex) {
        log.warn("Unreadable request body: {}", ex.getMessage());

        Throwable cause = ex.getCause();
        String message;

        if (cause instanceof InvalidFormatException ife) {
            // Right field, wrong value: "abc" sent for a number, or an unknown enum constant
            String field = toReadableField(jsonPath(ife));
            Class<?> target = ife.getTargetType();
            if (target != null && target.isEnum()) {
                message = String.format("\"%s\" is not a valid value for %s. Allowed values: %s.",
                        ife.getValue(), field, enumValues(target));
            } else {
                message = String.format("\"%s\" is not a valid %s for %s.",
                        ife.getValue(), typeName(target), field);
            }
        } else if (cause instanceof MismatchedInputException mie) {
            String field = jsonPath(mie);
            message = field.isEmpty()
                    ? "The request body is missing or empty."
                    : String.format("%s has the wrong format.", toReadableField(field));
        } else if (cause instanceof JsonParseException jpe) {
            message = String.format("The request body is not valid JSON (line %d, column %d).",
                    jpe.getLocation().getLineNr(), jpe.getLocation().getColumnNr());
        } else {
            message = "The request body is missing or could not be read.";
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message));
    }

    // 4) Wrong type on a path variable or query param
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String field = toReadableField(ex.getName());
        Class<?> required = ex.getRequiredType();
        String message;

        if (required != null && required.isEnum()) {
            message = String.format("\"%s\" is not a valid value for %s. Allowed values: %s.",
                    ex.getValue(), field, enumValues(required));
        } else {
            message = String.format("\"%s\" is not a valid %s for %s.",
                    ex.getValue(), typeName(required), field);
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message));
    }

    // 5) Missing required query parameter
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParams(MissingServletRequestParameterException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(String.format("%s is required.", toReadableField(ex.getParameterName()))));
    }

    // 6) Missing required multipart part (e.g. file upload)
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingPart(MissingServletRequestPartException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(String.format("%s is required.", toReadableField(ex.getRequestPartName()))));
    }

    // 7) Uploaded file too large
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleUploadTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error("The file you uploaded is too large. Please choose a smaller file."));
    }

    // 8) Wrong HTTP method on an existing endpoint
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        String supported = ex.getSupportedHttpMethods() == null ? "" :
                ex.getSupportedHttpMethods().stream().map(Object::toString).collect(Collectors.joining(", "));
        String message = supported.isEmpty()
                ? String.format("%s is not allowed on this endpoint.", ex.getMethod())
                : String.format("%s is not allowed on this endpoint. Supported: %s.", ex.getMethod(), supported);
        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error(message));
    }

    // 9) Wrong Content-Type
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        String supported = ex.getSupportedMediaTypes().stream()
                .map(Object::toString).collect(Collectors.joining(", "));
        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiResponse.error(String.format("Content type '%s' is not supported. Supported: %s.",
                        ex.getContentType(), supported)));
    }

    // 10) Database constraint violation — name the actual constraint that was hit
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String rootMessage = ex.getMostSpecificCause().getMessage();
        log.warn("Data integrity violation: {}", rootMessage);

        String message = resolveConstraintMessage(rootMessage);
        HttpStatus status = message.contains("no longer exists")
                ? HttpStatus.BAD_REQUEST
                : HttpStatus.CONFLICT;

        return ResponseEntity.status(status).body(ApiResponse.error(message));
    }

    // 11) Wrong username/password — deliberately vague: saying which one is wrong leaks account existence
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Incorrect username or password."));
    }

    // 12) Insufficient permissions
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You don't have permission to perform this action."));
    }

    // 13) Unknown endpoint (Boot 3.2+ throws NoResourceFoundException in most cases)
    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiResponse<Void>> handleNotFound(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("The page or resource you're looking for doesn't exist."));
    }

    // 14) Custom business exceptions — the message is written at the throw site, pass it through as-is
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(ApiResponse.error(ex.getMessage()));
    }

    // 15) Fallback — stays generic on purpose. Details go to the log, never to the response.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknownException(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Something went wrong on our side. Please try again in a moment."));
    }

    // ---------------------------------------------------------------- helpers

    /**
     * Returns the annotation's message untouched — that text is the contract with the user.
     * Only if a rule was declared with no message at all do we fall back to naming the field,
     * so the response is never empty or full of raw interpolation keys.
     */
    private String messageOf(String rawMessage, String field) {
        if (rawMessage == null || rawMessage.isBlank() || rawMessage.startsWith("{")) {
            return toReadableField(field) + " is not valid.";
        }
        return rawMessage;
    }

    /**
     * A single message is returned exactly as the DTO wrote it. Several messages are joined,
     * each given a full stop so they don't run together.
     */
    private String joinSentences(List<String> messages) {
        if (messages.isEmpty()) {
            return "The submitted data is not valid.";
        }
        if (messages.size() == 1) {
            return messages.get(0);
        }
        return messages.stream()
                .map(m -> m.endsWith(".") || m.endsWith("!") || m.endsWith("?") ? m : m + ".")
                .collect(Collectors.joining(" "));
    }

    /** Matches the DB error text against known constraint names. */
    private String resolveConstraintMessage(String rootMessage) {
        if (rootMessage != null) {
            String lower = rootMessage.toLowerCase(Locale.ROOT);
            for (Map.Entry<String, String> entry : CONSTRAINT_MESSAGES.entrySet()) {
                if (lower.contains(entry.getKey())) {
                    return entry.getValue();
                }
            }
        }
        return "This information conflicts with existing records. Please review and try again.";
    }

    /** Builds the JSON path Jackson failed on, e.g. "owner.address.city" or "horses[2].name". */
    private String jsonPath(JsonMappingException ex) {
        StringBuilder sb = new StringBuilder();
        for (JsonMappingException.Reference ref : ex.getPath()) {
            if (ref.getFieldName() != null) {
                if (sb.length() > 0) {
                    sb.append('.');
                }
                sb.append(ref.getFieldName());
            } else if (ref.getIndex() >= 0) {
                sb.append('[').append(ref.getIndex()).append(']');
            }
        }
        return sb.toString();
    }

    private String enumValues(Class<?> enumType) {
        return Arrays.stream(enumType.getEnumConstants())
                .map(String::valueOf)
                .collect(Collectors.joining(", "));
    }

    private String typeName(Class<?> type) {
        if (type == null) {
            return "value";
        }
        Class<?> boxed = type.isPrimitive() ? boxPrimitive(type) : type;
        return TYPE_NAMES.getOrDefault(boxed, boxed.getSimpleName().toLowerCase(Locale.ROOT));
    }

    private Class<?> boxPrimitive(Class<?> type) {
        if (type == int.class || type == short.class) return Integer.class;
        if (type == long.class) return Long.class;
        if (type == double.class || type == float.class) return Double.class;
        if (type == boolean.class) return Boolean.class;
        return type;
    }

    private String lastSegment(String path) {
        return path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
    }

    /**
     * Turns a technical field name into something a user can read:
     * "dateOfBirth" -> "Date of birth", "owner.email" -> "Email".
     */
    private String toReadableField(String field) {
        if (field == null || field.isBlank()) {
            return "This field";
        }
        String name = lastSegment(field);
        String spaced = name.replaceAll("([a-z0-9])([A-Z])", "$1 $2")
                .replace('_', ' ')
                .toLowerCase(Locale.ROOT)
                .trim();
        if (spaced.isEmpty()) {
            return "This field";
        }
        return Character.toUpperCase(spaced.charAt(0)) + spaced.substring(1);
    }
}