package com.hotel.backend.controller;

import com.hotel.backend.dto.FileDto;
import com.hotel.backend.dto.StorageStatsDto;
import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FileControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private FileService fileService;

    @InjectMocks
    private FileController fileController;

    private UserEntity testUser;
    private FileDto.FileResponse sampleFileResponse;

    @BeforeEach
    void setUp() {
        testUser = UserEntity.builder()
                .id(1L)
                .username("test_user")
                .email("test@filevault.com")
                .enabled(true)
                .build();

        HandlerMethodArgumentResolver userResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.getParameterType().isAssignableFrom(UserEntity.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return testUser;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(fileController)
                .setCustomArgumentResolvers(userResolver)
                .build();

        sampleFileResponse = new FileDto.FileResponse(
                "100",
                "test-document.pdf",
                "pdf",
                "documents",
                "application/pdf",
                2048L,
                "10",
                false,
                false,
                null,
                null,
                null,
                new FileDto.FileOwnerResponse(1L, "test_user", "test@filevault.com", null),
                List.of(),
                "/api/v1/files/100/download",
                null,
                "A test document",
                List.of("pdf", "test")
        );
    }

    @Test
    @DisplayName("GET /files returns list of user files")
    void getFiles_Success() throws Exception {
        when(fileService.getFiles(eq(testUser), any(), any(), any(), any(), any()))
                .thenReturn(List.of(sampleFileResponse));

        mockMvc.perform(get("/files")
                        .param("category", "documents")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("100"))
                .andExpect(jsonPath("$[0].name").value("test-document.pdf"))
                .andExpect(jsonPath("$[0].category").value("documents"));
    }

    @Test
    @DisplayName("GET /files/shared returns shared files")
    void getSharedFiles_Success() throws Exception {
        when(fileService.getSharedFiles(testUser)).thenReturn(List.of(sampleFileResponse));

        mockMvc.perform(get("/files/shared")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("100"));
    }

    @Test
    @DisplayName("GET /files/storage-stats returns storage overview")
    void getStorageStats_Success() throws Exception {
        StorageStatsDto.StorageStatsResponse stats = new StorageStatsDto.StorageStatsResponse(
                100000000L,
                5000000L,
                List.of(new StorageStatsDto.StorageCategoryStat("documents", "Documents", 5000000L, 5, "#3b82f6", "bg-blue-500"))
        );

        when(fileService.getStorageStats(testUser)).thenReturn(stats);

        mockMvc.perform(get("/files/storage-stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(100000000L))
                .andExpect(jsonPath("$.used").value(5000000L))
                .andExpect(jsonPath("$.categories[0].category").value("documents"));
    }

    @Test
    @DisplayName("GET /files/{id} returns file by id")
    void getFileById_Success() throws Exception {
        when(fileService.getFileById(100L, testUser)).thenReturn(sampleFileResponse);

        mockMvc.perform(get("/files/100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("100"))
                .andExpect(jsonPath("$.name").value("test-document.pdf"));
    }

    @Test
    @DisplayName("POST /files/upload uploads files successfully")
    void uploadFiles_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "files",
                "test.pdf",
                "application/pdf",
                "PDF Content".getBytes()
        );

        when(fileService.uploadFiles(anyList(), eq(10L), eq(testUser)))
                .thenReturn(List.of(sampleFileResponse));

        mockMvc.perform(multipart("/files/upload")
                        .file(file)
                        .param("folderId", "10"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].id").value("100"))
                .andExpect(jsonPath("$[0].name").value("test-document.pdf"));
    }

    @Test
    @DisplayName("POST /files/upload returns 400 when no files are provided")
    void uploadFiles_NoFiles_BadRequest() throws Exception {
        mockMvc.perform(multipart("/files/upload"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /files/{id}/download downloads file with attachment disposition")
    void downloadFile_Success() throws Exception {
        FileEntity entity = FileEntity.builder()
                .id(100L)
                .name("test-document.pdf")
                .mimeType("application/pdf")
                .build();
        Resource resource = new ByteArrayResource("PDF Content".getBytes());

        FileService.FileResourcePayload payload = new FileService.FileResourcePayload(resource, entity);
        when(fileService.getFileResource(100L, testUser)).thenReturn(payload);

        mockMvc.perform(get("/files/100/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(content().bytes("PDF Content".getBytes()));
    }

    @Test
    @DisplayName("GET /files/{id}/preview previews file with inline disposition")
    void previewFile_Success() throws Exception {
        FileEntity entity = FileEntity.builder()
                .id(100L)
                .name("test-document.pdf")
                .mimeType("application/pdf")
                .build();
        Resource resource = new ByteArrayResource("PDF Content".getBytes());

        FileService.FileResourcePayload payload = new FileService.FileResourcePayload(resource, entity);
        when(fileService.getFileResource(100L, testUser)).thenReturn(payload);

        mockMvc.perform(get("/files/100/preview"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", "inline"))
                .andExpect(content().bytes("PDF Content".getBytes()));
    }

    @Test
    @DisplayName("PATCH /files/{id}/rename updates file name")
    void renameFile_Success() throws Exception {
        when(fileService.renameFile(eq(100L), eq("new-name.pdf"), eq(testUser)))
                .thenReturn(sampleFileResponse);

        String json = """
                {
                    "name": "new-name.pdf"
                }
                """;

        mockMvc.perform(patch("/files/100/rename")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("100"));
    }

    @Test
    @DisplayName("PATCH /files/{id}/favorite toggles favorite")
    void toggleFavorite_Success() throws Exception {
        when(fileService.toggleFavorite(100L, testUser)).thenReturn(sampleFileResponse);

        mockMvc.perform(patch("/files/100/favorite")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("100"));
    }

    @Test
    @DisplayName("PATCH /files/{id}/trash moves file to trash")
    void moveToTrash_Success() throws Exception {
        doNothing().when(fileService).moveToTrash(100L, testUser);

        mockMvc.perform(patch("/files/100/trash")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("File moved to trash"));
    }

    @Test
    @DisplayName("PATCH /files/{id}/restore restores file from trash")
    void restoreFromTrash_Success() throws Exception {
        doNothing().when(fileService).restoreFromTrash(100L, testUser);

        mockMvc.perform(patch("/files/100/restore")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("File restored from trash"));
    }

    @Test
    @DisplayName("DELETE /files/{id} permanently deletes file")
    void deletePermanently_Success() throws Exception {
        doNothing().when(fileService).deletePermanently(100L, testUser);

        mockMvc.perform(delete("/files/100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("File permanently deleted"));
    }

    @Test
    @DisplayName("DELETE /files/trash/empty empties trash")
    void emptyTrash_Success() throws Exception {
        doNothing().when(fileService).emptyTrash(testUser);

        mockMvc.perform(delete("/files/trash/empty")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Trash emptied successfully"));
    }

    @Test
    @DisplayName("POST /files/{id}/share shares file with email")
    void shareFile_Success() throws Exception {
        when(fileService.shareFile(eq(100L), any(FileDto.FileShareRequest.class), eq(testUser)))
                .thenReturn(sampleFileResponse);

        String json = """
                {
                    "email": "colleague@filevault.com",
                    "role": "editor"
                }
                """;

        mockMvc.perform(post("/files/100/share")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("100"));
    }

    @Test
    @DisplayName("POST /files/{id}/share returns 400 when email is invalid")
    void shareFile_InvalidEmail_BadRequest() throws Exception {
        String json = """
                {
                    "email": "invalid-email",
                    "role": "editor"
                }
                """;

        mockMvc.perform(post("/files/100/share")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}
