# 结算竖线移动逻辑修复

## 问题描述
结算竖线应该在交易提交那一刻直接从最右边生成，然后每秒向左移动一次，直到1分钟后到达结算点。

## 原来的问题
之前的实现中，结算线的移动逻辑不正确：
- 结算线没有从图表的最右边开始
- 移动距离和目标位置计算错误

## 修复方案

### 新的移动逻辑
```javascript
// 计算结算线位置 - 从最右边开始向左移动
const tradeElapsedTime = now - tradeStartTime; // 交易已经过去的时间
const tradeDuration = 60000; // 1分钟交易时长
const remainingTime = tradeDuration - tradeElapsedTime; // 剩余时间

let settlementX;

if (remainingTime > 0) {
  // 交易进行中：结算线从图表最右边向左移动
  // 从totalChartWidth（图表最右边）开始，向historyZoneWidth（历史区域右边界）移动
  const timeProgress = tradeElapsedTime / tradeDuration; // 0到1的进度
  const totalDistance = totalChartWidth - historyZoneWidth; // 需要移动的总距离
  settlementX = totalChartWidth - (timeProgress * totalDistance); // 从最右边向左移动
} else {
  // 交易结算：结算线到达历史区域右边界
  settlementX = historyZoneWidth;
}
```

### 关键改进点

1. **起始位置**: 从 `totalChartWidth`（图表最右边）开始
2. **目标位置**: 移动到 `historyZoneWidth`（历史区域右边界，即当前时间位置）
3. **移动距离**: `totalDistance = totalChartWidth - historyZoneWidth`
4. **移动进度**: 基于 `tradeElapsedTime / tradeDuration` 计算

### 移动轨迹说明

```
图表布局：
[历史数据区域 (2/3)] | [预测区域 (1/3)]
                    ↑                ↑
              historyZoneWidth   totalChartWidth
              (当前时间位置)      (图表最右边)

结算线移动：
t=0秒:   结算线在 totalChartWidth (最右边)
t=30秒:  结算线在中间位置
t=60秒:  结算线到达 historyZoneWidth (当前时间位置，开始结算)
```

### 时间进度计算
- `timeProgress = 0` (交易开始): 结算线在最右边
- `timeProgress = 0.5` (30秒): 结算线在中间
- `timeProgress = 1` (60秒): 结算线到达当前时间位置，开始结算

## 用户体验

### 交易流程
1. **提交交易**: 结算线立即在图表最右边出现
2. **交易进行中**: 结算线每秒向左移动，直观显示剩余时间
3. **1分钟后**: 结算线到达当前时间位置，触发结算
4. **结算完成**: 结算线消失，显示结算结果

### 视觉效果
- 用户可以清楚看到结算线从右向左的移动
- 移动速度恒定，每秒移动固定距离
- 到达当前时间位置时准确触发结算

## 技术实现

### 位置计算公式
```javascript
// 当前位置 = 起始位置 - (进度 × 总距离)
settlementX = totalChartWidth - (timeProgress * totalDistance)

// 其中：
// totalChartWidth: 图表总宽度（最右边）
// historyZoneWidth: 历史区域宽度（当前时间位置）
// totalDistance: totalChartWidth - historyZoneWidth
// timeProgress: tradeElapsedTime / tradeDuration (0-1)
```

### 边界条件
- **最右位置**: `totalChartWidth` (交易开始时)
- **最左位置**: `historyZoneWidth` (结算时)
- **移动范围**: 预测区域的整个宽度

## 文件修改
- **文件**: `src/components/TradingChart.jsx`
- **修改行数**: 第645-661行
- **修改内容**: 结算线位置计算逻辑

## 测试验证
访问 http://localhost:5174/ 验证：
1. ✅ 提交交易后结算线立即在最右边出现
2. ✅ 结算线每秒向左移动一次
3. ✅ 1分钟后结算线到达当前时间位置
4. ✅ 结算线移动速度恒定且平滑

修复完成！现在结算线的移动行为完全符合预期。
