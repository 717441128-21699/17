import { useState } from 'react';
import { Tabs, Tag, Button, Form, Input, Select, DatePicker, List, message, Badge } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppStore } from '../store/useAppStore';
import type { Visitor } from '../types';

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'gold', label: '待审批' },
  approved: { color: 'green', label: '已批准' },
  rejected: { color: 'red', label: '已拒绝' },
  completed: { color: 'default', label: '已完成' },
};

export default function VisitorPanel() {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [form] = Form.useForm();

  const visitors = useAppStore((s) => s.visitors);
  const elders = useAppStore((s) => s.elders);
  const approveVisitor = useAppStore((s) => s.approveVisitor);
  const setVisitorPath = useAppStore((s) => s.setVisitorPath);
  const rooms = useAppStore((s) => s.rooms);

  const pendingCount = visitors.filter((v) => v.status === 'pending').length;

  const getElderName = (id: string) => {
    return elders.find((e) => e.id === id)?.name || '未知';
  };

  const handleApprove = (visitor: Visitor, approved: boolean) => {
    approveVisitor(visitor.id, approved);
    message.success(approved ? '已批准访问' : '已拒绝访问');
  };

  const handleGeneratePath = (visitor: Visitor) => {
    const elder = elders.find((e) => e.id === visitor.visitElderId);
    if (!elder) {
      message.error('未找到老人信息');
      return;
    }
    const entrance = { x: 0, y: 0, z: 0 };
    setVisitorPath({
      visitorId: visitor.id,
      from: entrance,
      to: elder.position,
      points: [entrance, elder.position],
    });
    message.success('已生成访客路径指引');
  };

  const handleSubmitNew = async () => {
    try {
      const values = await form.validateFields();
      const newVisitor: Visitor = {
        id: `visitor_${Date.now()}`,
        name: values.name,
        phone: values.phone,
        visitDate: values.visitDate.format('YYYY-MM-DD'),
        visitElderId: values.elderId,
        status: 'pending',
      };
      message.success(`已提交访客 ${newVisitor.name} 的预约申请`);
      setActiveTab('list');
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  const tabItems = [
    {
      key: 'list',
      label: (
        <Badge count={pendingCount} offset={[6, 0]}>
          预约列表
        </Badge>
      ),
    },
    { key: 'new', label: <UserAddOutlined /> },
  ];

  return (
    <div className="glass-panel glow-border w-[560px] max-h-[90vh] overflow-hidden flex flex-col animate-[slideInRight_0.3s_ease-out]">
      <div className="border-b border-[rgba(0,212,170,0.2)] p-4">
        <div className="flex items-center gap-2">
          <TeamOutlined style={{ color: '#00D4AA', fontSize: 20 }} />
          <span className="text-lg font-semibold text-white">访客管理</span>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,212,170,0.1)' }}
      />

      {activeTab === 'list' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visitors.length === 0 ? (
            <div className="text-center py-12 text-[#8C9BB3]">
              <TeamOutlined style={{ fontSize: 48, opacity: 0.3 }} />
              <div className="mt-3">暂无访客预约</div>
            </div>
          ) : (
            visitors.map((visitor) => {
              const sc = statusConfig[visitor.status];
              const elder = elders.find((e) => e.id === visitor.visitElderId);
              const room = elder ? rooms.find((r) => r.id === elder.roomId) : null;

              return (
                <div
                  key={visitor.id}
                  className="rounded-lg border border-[rgba(0,212,170,0.15)] bg-[rgba(0,212,170,0.03)] p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4AA]/30 to-[#00D4AA]/10 border border-[#00D4AA]/40 flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div>
                        <div className="font-medium text-white">{visitor.name}</div>
                        <div className="flex items-center gap-1 text-xs text-[#8C9BB3]">
                          <PhoneOutlined />
                          {visitor.phone}
                        </div>
                      </div>
                    </div>
                    <Tag color={sc.color}>{sc.label}</Tag>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-1.5 text-[#8C9BB3]">
                      <UserAddOutlined />
                      <span className="text-white">探望: {getElderName(visitor.visitElderId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#8C9BB3]">
                      <CalendarOutlined />
                      <span className="text-white">{visitor.visitDate}</span>
                    </div>
                    {room && (
                      <div className="flex items-center gap-1.5 text-[#8C9BB3] col-span-2">
                        <EnvironmentOutlined />
                        <span className="text-white">{room.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                    {visitor.status === 'pending' && (
                      <>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleApprove(visitor, true)}
                          className="tech-btn-primary"
                        >
                          审批通过
                        </Button>
                        <Button
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => handleApprove(visitor, false)}
                          style={{
                            background: 'rgba(255,77,79,0.1)',
                            border: '1px solid rgba(255,77,79,0.3)',
                            color: '#FF4D4F',
                          }}
                        >
                          拒绝
                        </Button>
                      </>
                    )}
                    {visitor.status === 'approved' && (
                      <Button
                        size="small"
                        icon={<EnvironmentOutlined />}
                        onClick={() => handleGeneratePath(visitor)}
                        className="tech-btn"
                      >
                        生成路径指引
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'new' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-sm text-[#8C9BB3] mb-4">填写访客预约信息</div>
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="访客姓名"
              rules={[{ required: true, message: '请输入访客姓名' }]}
            >
              <Input placeholder="请输入访客姓名" prefix={<TeamOutlined />} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
            </Form.Item>

            <Form.Item
              name="elderId"
              label="访问老人"
              rules={[{ required: true, message: '请选择要访问的老人' }]}
            >
              <Select
                placeholder="请选择要访问的老人"
                options={elders.map((e) => ({ label: e.name, value: e.id }))}
              />
            </Form.Item>

            <Form.Item
              name="visitDate"
              label="预约日期"
              rules={[{ required: true, message: '请选择预约日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择预约日期"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Button
              type="primary"
              block
              icon={<UserAddOutlined />}
              onClick={handleSubmitNew}
              className="tech-btn-primary"
              style={{ height: 44, marginTop: 8 }}
            >
              提交预约
            </Button>
          </Form>
        </div>
      )}
    </div>
  );
}
