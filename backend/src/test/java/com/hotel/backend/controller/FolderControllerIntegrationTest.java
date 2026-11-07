package com.hotel.backend.controller;

import com.hotel.backend.dto.FolderDto;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.service.FolderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FolderControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private FolderService folderService;

    @InjectMocks
    private FolderController folderController;

    private UserEntity testUser;
    private FolderDto.FolderResponse sampleResponse;

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

        mockMvc = MockMvcBuilders.standaloneSetup(folderController)
                .setCustomArgumentResolvers(userResolver)
                .build();

        sampleResponse = new FolderDto.FolderResponse(
                "10",
                "Work Documents",
                null,
                "#3b82f6",
                false,
                false,
                null,
                5,
                10240,
                LocalDateTime.now().toString(),
                LocalDateTime.now().toString(),
                new FolderDto.FolderOwnerResponse(1L, "test_user", "test@filevault.com")
        );
    }

    @Test
    @DisplayName("GET /folders returns list of folders")
    void getFolders_Success() throws Exception {
        when(folderService.getFolders(eq(testUser), any(), any())).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/folders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("10"))
                .andExpect(jsonPath("$[0].name").value("Work Documents"))
                .andExpect(jsonPath("$[0].fileCount").value(5))
                .andExpect(jsonPath("$[0].totalSize").value(10240));
    }

    @Test
    @DisplayName("GET /folders with trashed or favorite filters")
    void getFolders_WithFilters() throws Exception {
        when(folderService.getFolders(eq(testUser), eq(true), eq(false))).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/folders")
                        .param("trashed", "true")
                        .param("favorite", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("10"));
    }

    @Test
    @DisplayName("GET /folders/{id} returns folder details")
    void getFolderById_Success() throws Exception {
        when(folderService.getFolderById(10L, testUser)).thenReturn(sampleResponse);

        mockMvc.perform(get("/folders/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("10"))
                .andExpect(jsonPath("$.name").value("Work Documents"));
    }

    @Test
    @DisplayName("POST /folders creates folder successfully")
    void createFolder_Success() throws Exception {
        when(folderService.createFolder(any(FolderDto.FolderCreateRequest.class), eq(testUser)))
                .thenReturn(sampleResponse);

        String json = """
                {
                    "name": "Work Documents",
                    "color": "#3b82f6"
                }
                """;

        mockMvc.perform(post("/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("10"))
                .andExpect(jsonPath("$.name").value("Work Documents"));
    }

    @Test
    @DisplayName("POST /folders returns 400 when name is blank")
    void createFolder_ValidationFailure() throws Exception {
        String json = """
                {
                    "name": "",
                    "color": "#3b82f6"
                }
                """;

        mockMvc.perform(post("/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PATCH /folders/{id}/rename updates folder name")
    void renameFolder_Success() throws Exception {
        FolderDto.FolderResponse renamed = new FolderDto.FolderResponse(
                "10",
                "Updated Name",
                null,
                "#3b82f6",
                false,
                false,
                null,
                5,
                10240,
                null,
                null,
                null
        );

        when(folderService.renameFolder(eq(10L), eq("Updated Name"), eq(testUser))).thenReturn(renamed);

        String json = """
                {
                    "name": "Updated Name"
                }
                """;

        mockMvc.perform(patch("/folders/10/rename")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    @DisplayName("PATCH /folders/{id}/favorite toggles favorite status")
    void toggleFavorite_Success() throws Exception {
        when(folderService.toggleFavorite(eq(10L), eq(testUser))).thenReturn(sampleResponse);

        mockMvc.perform(patch("/folders/10/favorite")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("10"));
    }

    @Test
    @DisplayName("PATCH /folders/{id}/trash moves folder to trash")
    void moveToTrash_Success() throws Exception {
        doNothing().when(folderService).moveToTrash(10L, testUser);

        mockMvc.perform(patch("/folders/10/trash")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Folder moved to trash"));
    }

    @Test
    @DisplayName("PATCH /folders/{id}/restore restores folder from trash")
    void restoreFromTrash_Success() throws Exception {
        doNothing().when(folderService).restoreFromTrash(10L, testUser);

        mockMvc.perform(patch("/folders/10/restore")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Folder restored from trash"));
    }

    @Test
    @DisplayName("DELETE /folders/{id} deletes folder permanently")
    void deletePermanently_Success() throws Exception {
        doNothing().when(folderService).deletePermanently(10L, testUser);

        mockMvc.perform(delete("/folders/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Folder permanently deleted"));
    }
}
