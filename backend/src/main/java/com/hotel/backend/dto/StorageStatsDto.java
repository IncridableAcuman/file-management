package com.hotel.backend.dto;

import java.util.List;

public class StorageStatsDto {

    public record StorageCategoryStat(
            String category,
            String label,
            long size,
            int fileCount,
            String color,
            String accentBg
    ) {}

    public record StorageStatsResponse(
            long total,
            long used,
            List<StorageCategoryStat> categories
    ) {}
}
