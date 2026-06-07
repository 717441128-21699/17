import { useState, useMemo } from 'react';
import { Tabs, Tag, Button, message, Modal, Form, Select, Input, Space } from 'antd';
import {
  CalendarOutlined,
  SwapOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppStore } from '../store/useAppStore';
import type { Schedule, ShiftChangeRequest, Role } from '../types';

const shiftConfig: Record<string, { label: string; color: string; bg: string }> = {
  morning: { label: '早班', color: '#FAAD14', bg: 'rgba(250, 173, 20, 0.2)' },
  afternoon: { label: '中班', color: '#1890FF', bg: 'rgba(24, 144, 255, 0.2)' },
  night: { label: '晚班', color: '#722ED1', bg: 'rgba(114, 46, 209, 0.2)' },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending_head: { color: 'gold', label: '待护士长审批' },
  pending_director: { color: 'blue', label: '待院长审批' },
  approved: { color: 'green', label: '已批准' },
  rejected: { color: 'red', label: '已拒绝' },
};

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function SchedulePanel() {
  const [activeTab, setActiveTab] = useState<string>('schedule');
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [form] = Form.useForm();

  const schedules = useAppStore((s) => s.schedules);
  const caregivers = useAppStore((s) => s.caregivers);
  const shiftChangeRequests = useAppStore((s) => s.shiftChangeRequests);
  const currentUser = useAppStore((s) => s.currentUser);
  const submitShiftChange = useAppStore((s) => s.submitShiftChange);
  const approveShiftChange = useAppStore((s) => s.approveShiftChange);

  const weekDates = useMemo(() => {
    const startOfWeek = dayjs().startOf('week').add(1, 'day');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
  }, []);

  const scheduleMap = useMemo(() => {
    const map = new Map<string, Schedule>();
    schedules.forEach((s) => {
      map.set(`${s.caregiverId}_${s.date}`, s);
    });
    return map;
  }, [schedules]);

  const getIntensityColor = (count: number): string => {
    if (count === 0) return 'rgba(0, 212, 170, 0.05)';
    if (count <= 3) return 'rgba(0, 212, 170, 0.15)';
    if (count <= 5) return 'rgba(0, 212, 170, 0.3)';
    return 'rgba(0, 212, 170, 0.5)';
  };

  const getShiftForCell = (caregiverId: string, date: string) => {
    return scheduleMap.get(`${caregiverId}_${date}`);
  };

  const handleCellClick = (schedule: Schedule | undefined, date: string, caregiverId: string) => {
    if (schedule) {
      setSelectedSchedule(schedule);
      form.setFieldsValue({
        targetDate: date,
        targetShift: schedule.shift,
        reason: '',
      });
      setShiftModalOpen(true);
    }
  };

  const handleSubmitShiftChange = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedSchedule || !currentUser) return;

      submitShiftChange({
        applicantId: currentUser.id,
        originalScheduleId: selectedSchedule.id,
        targetDate: values.targetDate,
        targetShift: values.targetShift,
        reason: values.reason,
      });

      message.success('调班申请已提交');
      setShiftModalOpen(false);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleApprove = (request: ShiftChangeRequest, approved: boolean) => {
    if (!currentUser) return;
    const role: Role = currentUser.role;
    if (role === 'caregiver') {
      message.error('您没有审批权限');
      return;
    }
    approveShiftChange(request.id, role, approved);
    message.success(approved ? '已批准' : '已拒绝');
  };

  const canApprove = (request: ShiftChangeRequest): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'head_nurse' && request.status === 'pending_head') return true;
    if (currentUser.role === 'director' && request.status === 'pending_director') return true;
    return false;
  };

  const getCaregiverName = (id: string) => {
    return caregivers.find((c) => c.id === id)?.name || '未知';
  };

  const tabItems = [
    { key: 'schedule', label: '排班表', icon: <CalendarOutlined /> },
    { key: 'requests', label: '调班申请', icon: <SwapOutlined /> },
  ];

  return (
    <div className="glass-panel glow-border w-[720px] max-h-[90vh] overflow-hidden flex flex-col animate-[slideInRight_0.3s_ease-out]">
      <div className="border-b border-[rgba(0,212,170,0.2)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarOutlined style={{ color: '#00D4AA', fontSize: 20 }} />
            <span className="text-lg font-semibold text-white">排班管理</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: shiftConfig.morning.bg }} />
              <span className="text-[#8C9BB3]">早班</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: shiftConfig.afternoon.bg }} />
              <span className="text-[#8C9BB3]">中班</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: shiftConfig.night.bg }} />
              <span className="text-[#8C9BB3]">晚班</span>
            </span>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,212,170,0.1)' }}
      />

      {activeTab === 'schedule' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-3 text-sm text-[#8C9BB3]">
            本周排班 · {weekDates[0]} 至 {weekDates[6]}
            <span className="ml-3 text-xs">点击班次格子可申请调班</span>
          </div>
          <div className="min-w-[640px]">
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="h-10 flex items-center px-2 text-sm text-[#8C9BB3]">护工</div>
              {weekDays.map((day, i) => (
                <div key={day} className="h-10 flex flex-col items-center justify-center text-xs">
                  <span className="text-[#8C9BB3]">{day}</span>
                  <span className="text-white text-[10px]">{weekDates[i].slice(5)}</span>
                </div>
              ))}
            </div>
            {caregivers.map((cg) => {
              const weekCount = weekDates.reduce((sum, date) => {
                return sum + (scheduleMap.has(`${cg.id}_${date}`) ? 1 : 0);
              }, 0);

              return (
                <div key={cg.id} className="grid grid-cols-8 gap-1 mb-1">
                  <div
                    className="h-12 flex items-center px-2 text-sm rounded text-white"
                    style={{ background: getIntensityColor(weekCount) }}
                  >
                    <div className="w-7 h-7 rounded-full bg-[rgba(0,212,170,0.2)] flex items-center justify-center mr-2 text-xs">
                      👩‍⚕️
                    </div>
                    {cg.name}
                  </div>
                  {weekDates.map((date) => {
                    const schedule = getShiftForCell(cg.id, date);
                    const sc = schedule ? shiftConfig[schedule.shift] : null;
                    return (
                      <div
                        key={`${cg.id}_${date}`}
                        className={`h-12 rounded flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:scale-105 ${
                          schedule ? '' : 'opacity-40'
                        }`}
                        style={{
                          background: sc ? sc.bg : 'rgba(255,255,255,0.02)',
                          border: sc ? `1px solid ${sc.color}40` : '1px solid rgba(255,255,255,0.05)',
                          color: sc ? sc.color : '#5C6B85',
                        }}
                        onClick={() => handleCellClick(schedule, date, cg.id)}
                      >
                        {sc ? sc.label : '休'}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {shiftChangeRequests.length === 0 ? (
            <div className="text-center py-12 text-[#8C9BB3]">
              <SwapOutlined style={{ fontSize: 48, opacity: 0.3 }} />
              <div className="mt-3">暂无调班申请</div>
            </div>
          ) : (
            shiftChangeRequests.map((req) => {
              const origSchedule = schedules.find((s) => s.id === req.originalScheduleId);
              const origSc = origSchedule ? shiftConfig[origSchedule.shift] : null;
              const targetSc = shiftConfig[req.targetShift];
              const sc = statusConfig[req.status];
              const showApprove = canApprove(req);

              return (
                <div
                  key={req.id}
                  className="rounded-lg border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.03)] p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[rgba(0,212,170,0.2)] flex items-center justify-center">
                        👩‍⚕️
                      </div>
                      <div>
                        <div className="font-medium text-white">{getCaregiverName(req.applicantId)}</div>
                        <div className="text-xs text-[#8C9BB3]">调班申请</div>
                      </div>
                    </div>
                    <Tag color={sc.color}>{sc.label}</Tag>
                  </div>

                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <div className="flex-1">
                      <div className="text-xs text-[#8C9BB3] mb-1">原班次</div>
                      {origSchedule && (
                        <div
                          className="inline-block px-2 py-1 rounded text-xs"
                          style={{ background: origSc!.bg, color: origSc!.color }}
                        >
                          {origSchedule.date.slice(5)} {origSc!.label}
                        </div>
                      )}
                    </div>
                    <SwapOutlined style={{ color: '#00D4AA' }} />
                    <div className="flex-1">
                      <div className="text-xs text-[#8C9BB3] mb-1">目标班次</div>
                      <div
                        className="inline-block px-2 py-1 rounded text-xs"
                        style={{ background: targetSc.bg, color: targetSc.color }}
                      >
                        {req.targetDate.slice(5)} {targetSc.label}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-[#8C9BB3] mb-3 bg-[rgba(0,0,0,0.2)] rounded p-2">
                    申请原因: {req.reason}
                  </div>

                  {showApprove && (
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleApprove(req, true)}
                        className="tech-btn-primary"
                      >
                        通过
                      </Button>
                      <Button
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleApprove(req, false)}
                        style={{
                          background: 'rgba(255,77,79,0.1)',
                          border: '1px solid rgba(255,77,79,0.3)',
                          color: '#FF4D4F',
                        }}
                      >
                        拒绝
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <Modal
        title="申请调班"
        open={shiftModalOpen}
        onCancel={() => setShiftModalOpen(false)}
        onOk={handleSubmitShiftChange}
        okText="提交申请"
        okButtonProps={{ className: 'tech-btn-primary' }}
        styles={{ content: { background: '#0F1E36', border: '1px solid rgba(0,212,170,0.2)' } }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="targetDate"
            label="目标日期"
            rules={[{ required: true, message: '请选择目标日期' }]}
          >
            <Select
              options={weekDates.map((d) => ({ label: d, value: d }))}
              placeholder="选择日期"
            />
          </Form.Item>
          <Form.Item
            name="targetShift"
            label="目标班次"
            rules={[{ required: true, message: '请选择目标班次' }]}
          >
            <Select
              options={Object.entries(shiftConfig).map(([key, val]) => ({
                label: val.label,
                value: key,
              }))}
              placeholder="选择班次"
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="调班原因"
            rules={[{ required: true, message: '请填写调班原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请说明调班原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
