# Analytics Recent Visitors - Time Range Filtering

## ✅ Feature Implemented

Added time range filtering to the **Recent Visitors** section in the admin analytics dashboard with three options:
- **1 Day** - Last 24 hours of visitors
- **7 Days** - Last week of visitors (default)
- **1 Month** - Last 30 days of visitors

---

## 🔧 Changes Made

### **1. API Route Updates** (`/api/admin/analytics/route.ts`)

#### **Added Query Parameter Support:**
```typescript
export async function GET(request: NextRequest) {
  // Get time range from query params (default: 7 days)
  const { searchParams } = new URL(request.url);
  const visitorRange = searchParams.get('visitorRange') || '7'; // 1, 7, or 30 days
```

#### **Dynamic Time Range Calculation:**
```typescript
// Determine visitor time range based on parameter
let visitorTimeRange: Date;
switch (visitorRange) {
  case '1':
    visitorTimeRange = oneDayAgo;
    break;
  case '30':
    visitorTimeRange = oneMonthAgo;
    break;
  case '7':
  default:
    visitorTimeRange = oneWeekAgo;
    break;
}
```

#### **Dynamic Visitor Limits:**
```typescript
// Adjust limits based on time range
const limit = visitorRange === '1' ? 50 : visitorRange === '7' ? 100 : 200;

recentVisitors = await db.collection('user_sessions').find({
  createdAt: { $gte: visitorTimeRange }
}).sort({ createdAt: -1 }).limit(limit).toArray();
```

**Limits by Range:**
- 1 Day: 50 visitors
- 7 Days: 100 visitors
- 1 Month: 200 visitors

---

### **2. Frontend Component Updates** (`AnalyticsDashboard.tsx`)

#### **Added State Management:**
```typescript
const [visitorRange, setVisitorRange] = useState<'1' | '7' | '30'>('7');
```

#### **Updated API Call:**
```typescript
const response = await fetch(`/api/admin/analytics?visitorRange=${visitorRange}`);
```

#### **Added Dependency:**
```typescript
useEffect(() => {
  fetchAnalytics();
  const interval = setInterval(fetchAnalytics, 30000);
  return () => clearInterval(interval);
}, [visitorRange]); // Re-fetch when range changes
```

#### **Filter Buttons UI:**
```typescript
<div className="flex gap-2">
  <button
    onClick={() => setVisitorRange('1')}
    className={visitorRange === '1' ? 'active-style' : 'inactive-style'}
  >
    1 Day
  </button>
  <button
    onClick={() => setVisitorRange('7')}
    className={visitorRange === '7' ? 'active-style' : 'inactive-style'}
  >
    7 Days
  </button>
  <button
    onClick={() => setVisitorRange('30')}
    className={visitorRange === '30' ? 'active-style' : 'inactive-style'}
  >
    1 Month
  </button>
</div>
```

---

## 🎨 UI Design

### **Filter Buttons:**
- **Active State:** Cyan background with glow effect (`bg-cyan-500`)
- **Inactive State:** Gray background with border (`bg-gray-700/50`)
- **Hover Effect:** Darker gray on hover
- **Responsive:** Wraps on small screens
- **Consistent Styling:** Matches NYALTX design system

### **Header Layout:**
```
┌─────────────────────────────────────────────────────┐
│ 🕒 Recent Visitors    [1 Day] [7 Days] [1 Month]   │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ Features

### **1. Dynamic Filtering:**
- Click any button to switch time ranges
- Data refreshes immediately
- Loading state during fetch

### **2. Auto-Refresh:**
- Continues to refresh every 30 seconds
- Uses current selected range
- Maintains filter selection

### **3. Smart Limits:**
- Optimized result limits for each range
- Prevents overwhelming data display
- Better performance with larger ranges

### **4. Visual Feedback:**
- Active button highlighted in cyan
- Smooth transitions between states
- Consistent with dashboard design

---

## 📊 Data Flow

### **User Interaction:**
1. User clicks time range button (1 Day / 7 Days / 1 Month)
2. State updates → `setVisitorRange('1' | '7' | '30')`
3. useEffect triggers with new dependency
4. API called with query parameter: `/api/admin/analytics?visitorRange=${range}`
5. Backend filters visitors based on range
6. Frontend displays filtered results
7. Auto-refresh continues every 30 seconds with selected range

### **API Query Examples:**
```
GET /api/admin/analytics?visitorRange=1   → Last 24 hours
GET /api/admin/analytics?visitorRange=7   → Last 7 days (default)
GET /api/admin/analytics?visitorRange=30  → Last 30 days
```

---

## 🧪 Testing

### **Manual Testing:**
1. Go to `/admin/analytics`
2. Scroll to "Recent Visitors" section
3. Click "1 Day" button
   - ✅ Button turns cyan with glow
   - ✅ Visitor list updates to last 24 hours
   - ✅ Other buttons show inactive state
4. Click "7 Days" button
   - ✅ Updates to last 7 days
   - ✅ Active state switches
5. Click "1 Month" button
   - ✅ Updates to last 30 days
   - ✅ More visitors displayed (up to 200)
6. Wait 30 seconds
   - ✅ Data auto-refreshes with current filter

### **Expected Results:**
| Range | Time Period | Limit | Use Case |
|-------|------------|-------|----------|
| 1 Day | Last 24 hours | 50 | Recent activity |
| 7 Days | Last week | 100 | Weekly overview |
| 1 Month | Last 30 days | 200 | Monthly trends |

---

## 💡 Benefits

### **For Admins:**
- ✅ **Flexible Time Ranges** - View visitors across different periods
- ✅ **Quick Filtering** - One-click to switch views
- ✅ **Better Context** - Understand traffic patterns over time
- ✅ **Optimized Display** - Appropriate data limits for each range

### **For Analysis:**
- ✅ **Recent Activity** - 1 Day for immediate trends
- ✅ **Weekly Patterns** - 7 Days for week-over-week comparison
- ✅ **Monthly Trends** - 30 Days for longer-term analysis

### **Technical:**
- ✅ **Performance** - Smart limits prevent data overload
- ✅ **Responsive** - Works on all device sizes
- ✅ **Real-time** - Auto-refresh maintains current filter
- ✅ **Type Safe** - Full TypeScript support

---

## 🔄 Auto-Refresh Behavior

The analytics dashboard refreshes every 30 seconds while maintaining the selected time range:

```typescript
// Refresh every 30 seconds with current filter
const interval = setInterval(fetchAnalytics, 30000);
```

**Example:**
1. User selects "1 Day" filter
2. Dashboard shows last 24 hours
3. After 30 seconds, data refreshes
4. Still shows last 24 hours (keeps filter)
5. Process repeats automatically

---

## 📱 Responsive Design

### **Desktop:**
```
Recent Visitors    [1 Day] [7 Days] [1 Month]
```

### **Mobile:**
```
Recent Visitors
[1 Day] [7 Days] [1 Month]
```

Buttons wrap to new line on small screens using `flex-wrap` class.

---

## 🎯 Use Cases

### **1. Daily Monitoring:**
- Select "1 Day" to see today's visitors
- Quick check on recent traffic
- Identify current active users

### **2. Weekly Analysis:**
- Default "7 Days" view
- Week-over-week comparisons
- Standard analytics period

### **3. Monthly Trends:**
- Select "1 Month" for bigger picture
- Identify long-term patterns
- Track growth over time

---

## 🔧 Configuration

### **Default Range:**
```typescript
const [visitorRange, setVisitorRange] = useState<'1' | '7' | '30'>('7');
```
Default is set to **7 days** (weekly view).

### **Customization:**
To change limits, modify in API route:
```typescript
const limit = visitorRange === '1' ? 50 : visitorRange === '7' ? 100 : 200;
```

---

## ✅ Implementation Checklist

- [x] Add `visitorRange` query parameter to API
- [x] Implement time range switching logic in backend
- [x] Add dynamic limits based on range
- [x] Add state management in frontend
- [x] Create filter buttons UI
- [x] Update API call with query parameter
- [x] Add `visitorRange` to useEffect dependencies
- [x] Style active/inactive button states
- [x] Test all three time ranges
- [x] Verify auto-refresh maintains filter

---

## 📈 Future Enhancements

Potential improvements:
- [ ] Custom date range picker
- [ ] Export filtered visitor data
- [ ] Compare time periods (e.g., this week vs last week)
- [ ] Visitor analytics charts/graphs
- [ ] Filter by country/region
- [ ] Filter by wallet connection status

---

**Feature Status:** ✅ COMPLETE

The Recent Visitors section now has dynamic time range filtering with 1 day, 7 days, and 1 month options, providing admins with flexible visitor analytics! 🎉
