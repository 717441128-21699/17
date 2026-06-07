import * as XLSX from 'xlsx';
import type { DailyReport } from '../types';

export function exportDailyReportToExcel(reportData: DailyReport, date: string): void {
  const wb = XLSX.utils.book_new();

  const occupancyData = reportData.occupancyStats.map((item) => ({
    区域名称: item.areaName,
    房间数: item.roomCount,
    已入住: item.occupied,
    '入住率%': item.occupancyRate,
  }));
  const ws1 = XLSX.utils.json_to_sheet(occupancyData);
  XLSX.utils.book_append_sheet(wb, ws1, '入住率统计');

  const healthEventData = reportData.healthEventStats.map((item) => ({
    事件类型: item.eventType,
    数量: item.count,
    '处理率%': item.resolveRate,
  }));
  const ws2 = XLSX.utils.json_to_sheet(healthEventData);
  XLSX.utils.book_append_sheet(wb, ws2, '健康事件统计');

  const scheduleData = reportData.scheduleStats.map((item) => ({
    护工姓名: item.caregiverName,
    早班天数: item.morningDays,
    中班天数: item.afternoonDays,
    晚班天数: item.nightDays,
    总天数: item.totalDays,
  }));
  const ws3 = XLSX.utils.json_to_sheet(scheduleData);
  XLSX.utils.book_append_sheet(wb, ws3, '护工排班统计');

  const fileName = `运营日报_${date}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
