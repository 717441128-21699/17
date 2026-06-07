import { useState, useMemo } from 'react';
import { Input, Select, Button, Tag, message, Tabs, List, Badge } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store/useAppStore';
import type { Medicine } from '../types';

const categories = [
  { label: '全部', value: 'all' },
  { label: '心血管', value: 'cardio' },
  { label: '降压', value: 'blood' },
  { label: '降糖', value: 'sugar' },
  { label: '消化', value: 'digest' },
  { label: '其他', value: 'other' },
];

function getCategoryOfMedicine(name: string): string {
  if (name.includes('阿司匹林') || name.includes('氯吡格雷') || name.includes('阿托伐他汀') || name.includes('辛伐他汀')) return 'cardio';
  if (name.includes('硝苯地平') || name.includes('缬沙坦') || name.includes('氨氯地平') || name.includes('美托洛尔') || name.includes('氢氯噻嗪') || name.includes('螺内酯')) return 'blood';
  if (name.includes('二甲双胍')) return 'sugar';
  if (name.includes('奥美拉唑') || name.includes('多潘立酮') || name.includes('氨溴索')) return 'digest';
  return 'other';
}

function getMedicineColor(name: string): string {
  const palette = [
    'linear-gradient(135deg, #FF6B6B, #EE5A5A)',
    'linear-gradient(135deg, #4ECDC4, #44A08D)',
    'linear-gradient(135deg, #556270, #4ECDC4)',
    'linear-gradient(135deg, #A1FFCE, #FAFFD1)',
    'linear-gradient(135deg, #F7971E, #FFD200)',
    'linear-gradient(135deg, #8E2DE2, #4A00E0)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function PillBox3D({ name }: { name: string }) {
  const gradient = getMedicineColor(name);
  return (
    <div
      className="w-full h-24 rounded-lg relative overflow-hidden flex items-center justify-center"
      style={{
        background: gradient,
        transform: 'perspective(200px) rotateX(10deg) rotateY(-10deg)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1/3 rounded-t-lg"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)',
        }}
      />
      <MedicineBoxOutlined style={{ fontSize: 32, color: 'rgba(255,255,255,0.95)' }} />
      <div
        className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-black/30"
      >
        {name.slice(0, 2)}
      </div>
    </div>
  );
}

export default function PharmacyPanel() {
  const [activeTab, setActiveTab] = useState<string>('medicines');
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('all');

  const medicines = useAppStore((s) => s.medicines);
  const requestRefill = useAppStore((s) => s.requestRefill);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchSearch = m.name.includes(searchText) || m.dosage.includes(searchText);
      const matchCategory = category === 'all' || getCategoryOfMedicine(m.name) === category;
      return matchSearch && matchCategory;
    });
  }, [medicines, searchText, category]);

  const refillRequests = useMemo(() => {
    return medicines.filter((m) => m.refillRequested);
  }, [medicines]);

  const handleRefill = (medicine: Medicine) => {
    requestRefill(medicine.id);
    message.success(`已提交 ${medicine.name} 补药申请`);
  };

  const tabItems = [
    { key: 'medicines', label: '药品库存' },
    {
      key: 'requests',
      label: (
        <Badge count={refillRequests.length} offset={[6, 0]}>
          补药申请
        </Badge>
      ),
    },
  ];

  return (
    <div className="glass-panel glow-border w-[640px] max-h-[90vh] overflow-hidden flex flex-col animate-[slideInRight_0.3s_ease-out]">
      <div className="border-b border-[rgba(0,212,170,0.2)] p-4">
        <div className="flex items-center gap-2 mb-4">
          <MedicineBoxOutlined style={{ color: '#00D4AA', fontSize: 20 }} />
          <span className="text-lg font-semibold text-white">药品管理</span>
        </div>
        {activeTab === 'medicines' && (
          <div className="flex gap-3">
            <Input
              prefix={<SearchOutlined style={{ color: '#8C9BB3' }} />}
              placeholder="搜索药品名称、剂量"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              value={category}
              onChange={setCategory}
              options={categories}
              style={{ width: 120 }}
            />
          </div>
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,212,170,0.1)' }}
      />

      {activeTab === 'medicines' && (
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-12 text-[#8C9BB3]">
              <MedicineBoxOutlined style={{ fontSize: 48, opacity: 0.3 }} />
              <div className="mt-3">暂无药品</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredMedicines.map((med) => {
                const isLow = med.remainingDays < 3;

                return (
                  <div
                    key={med.id}
                    className={`rounded-lg border p-3 transition-all duration-300 hover:scale-[1.02] ${
                      isLow ? 'alert-blink' : ''
                    }`}
                    style={{
                      background: isLow ? 'rgba(250, 173, 20, 0.05)' : 'rgba(0, 212, 170, 0.03)',
                      borderColor: isLow ? 'rgba(250, 173, 20, 0.3)' : 'rgba(0, 212, 170, 0.15)',
                    }}
                  >
                    <PillBox3D name={med.name} />
                    <div className="mt-3">
                      <div className="text-sm font-medium text-white truncate">{med.name}</div>
                      <div className="text-xs text-[#8C9BB3] mt-0.5">{med.dosage}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs">
                        {isLow ? (
                          <Tag color="warning">
                            <WarningOutlined /> 剩{med.remainingDays}天
                          </Tag>
                        ) : (
                          <Tag color="green">
                            <CheckCircleOutlined /> 剩{med.remainingDays}天
                          </Tag>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#8C9BB3]">
                        <ClockCircleOutlined />
                        {med.nextDoseTime}
                      </div>
                    </div>

                    <Button
                      type={isLow ? 'primary' : 'default'}
                      size="small"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => handleRefill(med)}
                      className={isLow ? 'tech-btn-primary' : 'tech-btn'}
                      disabled={med.refillRequested}
                      style={{ marginTop: 8 }}
                    >
                      {med.refillRequested ? '已申请补药' : '补药'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="flex-1 overflow-y-auto p-4">
          {refillRequests.length === 0 ? (
            <div className="text-center py-12 text-[#8C9BB3]">
              <CheckCircleOutlined style={{ fontSize: 48, opacity: 0.3 }} />
              <div className="mt-3">暂无补药申请</div>
            </div>
          ) : (
            <List
              dataSource={refillRequests}
              renderItem={(med) => (
                <List.Item className="!px-0 !py-3 border-b !border-[rgba(0,212,170,0.1)] last:border-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ background: 'rgba(0, 212, 170, 0.15)' }}
                      >
                        💊
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{med.name}</div>
                        <div className="text-[#8C9BB3] text-xs">
                          {med.dosage} · 剩余{med.remainingDays}天
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-[#8C9BB3]">申请时间: 今天</div>
                      <Tag color="processing">待处理</Tag>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
