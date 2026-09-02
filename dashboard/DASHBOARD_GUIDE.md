# 📊 Interactive Student Performance Dashboard

## ✨ New Features

Your dashboard has been transformed into a powerful analytics platform with interactive visualizations, real-time analysis, and comprehensive student monitoring capabilities.

### 🎯 Key Features Added

#### 1. **📈 Analytics Overview Tab**
   - **KPI Cards**: Display total students, high-risk count, average attendance, average score, and fee overdue metrics
   - **Risk Distribution Pie Chart**: Visual breakdown of students by risk level (High/Medium/Low)
   - **Score Distribution Bar Chart**: Shows how students are distributed across score ranges
   - **Attendance Distribution Line Chart**: Visualizes attendance patterns across different percentage ranges
   - **Failing Subject Analysis**: Identifies students struggling with multiple subjects

#### 2. **🔍 Analysis & Insights Tab**
   - **Smart Analysis Panel**: Displays critical insights with actionable metrics
     - Critical Cases: Students with low attendance AND failing subjects
     - Attendance Alerts: Students below 70% attendance
     - Fee Overdue: Students with overdue fees (>30 days)
     - Score Improving: Students with positive trends
   - **Interactive Filters**: 
     - Filter by Risk Level (High/Medium/All)
     - Filter by Class Section
     - Filter by Stream
     - Reset filters to start over
   - **Detailed Analysis Table**: Sortable student data with all key metrics

#### 3. **👥 Complete Students Tab**
   - Full student directory with filters
   - Click-to-view detailed student information
   - Easy navigation with responsive table layout

#### 4. **🎨 Enhanced UI/UX**
   - Modern gradient header
   - Color-coded risk levels (Red: High, Yellow: Medium, Green: Low)
   - Interactive tab navigation
   - Responsive grid layouts
   - Smooth animations and transitions
   - Professional color scheme

### 📊 Visualizations Included

1. **Pie Chart** - Risk distribution overview
2. **Bar Charts** - Score and subject failure analysis
3. **Line Chart** - Attendance trends
4. **KPI Cards** - Key metrics at a glance
5. **Trend Indicators** - Visual arrows showing improvement/decline
6. **Risk Badges** - Color-coded risk levels

### 🔧 Technology Stack

- **React 19+** - Modern React with hooks
- **Recharts** - Beautiful, responsive chart library
- **CSS Grid & Flexbox** - Responsive layouts
- **Inline Styling** - Clean component-level styles

### 📦 Installation

```bash
npm install
```

This will install:
- `react`: Core React library
- `react-dom`: React DOM rendering
- `recharts`: Chart visualization library

### 🚀 Running the Dashboard

**Development Mode:**
```bash
npm run dev
```

Then open your browser to the URL shown (typically `http://localhost:5173`)

**Production Build:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run preview
```

### 📋 Component Structure

```
src/
├── App.jsx                          # Main dashboard container
├── components/
│   ├── AnalyticsMetrics.jsx        # KPI cards display
│   ├── RiskDistributionChart.jsx   # Pie chart - risk breakdown
│   ├── AttendanceTrendChart.jsx    # Line chart - attendance patterns
│   ├── PerformanceChart.jsx        # Bar chart - score distribution
│   ├── SubjectAnalysis.jsx         # Bar chart - failing subjects
│   ├── RiskAnalysisPanel.jsx       # Smart insights panel
│   ├── InteractiveFilters.jsx      # Filter controls
│   ├── RiskAnalysisTable.jsx       # Detailed filtered table
│   ├── StudentTable.jsx            # Full student list
│   ├── RiskBadge.jsx               # Risk level badge
│   └── TrendIndicator.jsx          # Trend direction indicator
├── hooks/
│   └── useAtRiskStudents.js        # Data fetching hook
├── api/
│   ├── config.js                   # API configuration
│   └── students.js                 # API calls
├── utils/
│   └── riskLevel.js                # Risk calculation utility
└── styles/
    ├── App.css                     # Component styles
    └── index.css                   # Global styles
```

### 🎮 How to Use

1. **View Overview**: Start with the Overview tab to see all key metrics and charts at a glance
2. **Drill Down**: Use the Analysis tab to dig deeper into specific risk segments
3. **Filter Data**: Apply filters to focus on specific classes, streams, or risk levels
4. **Monitor Students**: Check the Students tab for the complete directory

### 💡 Analysis Features

- **Risk Assessment**: Automatic categorization based on dropout probability
- **Trend Analysis**: Track attendance and score trends over time
- **Multi-factor Analysis**: Combines attendance, scores, and financial status
- **Actionable Insights**: Recommends specific interventions for each risk group

### 📱 Responsive Design

The dashboard is fully responsive and works great on:
- Desktop (1200px+)
- Tablet (768px - 1200px)
- Mobile (< 768px)

### 🔐 Data Privacy

All data processing happens on the client side. No sensitive information is logged.

### 🐛 Troubleshooting

**Charts not showing?**
- Make sure Recharts is installed: `npm install recharts`

**Filters not working?**
- Clear browser cache and refresh
- Check browser console for errors

**API errors?**
- Verify the API endpoint in `src/api/config.js`
- Ensure the backend server is running

### 📞 Support

For issues or feature requests, check the browser console for detailed error messages.

---

**Dashboard Version**: 2.0 Enhanced Analytics Edition
**Last Updated**: 2024
