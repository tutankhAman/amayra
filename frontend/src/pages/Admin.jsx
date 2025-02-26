import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import { analyticsService } from '../utils/api';
import { useOrderStatus } from '../context/OrderStatusContext';

const Admin = () => {
  const navigate = useNavigate();
  const { ordersEnabled, toggleOrderStatus } = useOrderStatus();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: salesData, isLoading: salesLoading, error } = useQuery(
    ['salesAnalytics', dateRange],
    async () => {
      const response = await analyticsService.getSales({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      console.log('Raw API Response:', response);
      // Extract the actual data from the nested structure
      return response.data?.data || null;
    },
    {
      refetchInterval: 30000,
      retry: 3,
      onError: (error) => {
        console.error('Analytics fetch error:', error);
      }
    }
  );

  // Check if we have valid data
  const hasData = salesData && Object.keys(salesData).length > 0;
  // console.log('Processed Sales Data:', salesData);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const gradientColors = {
    revenue: ['#34d399', '#059669'],
    orders: ['#60a5fa', '#2563eb'],
    average: ['#a78bfa', '#7c3aed'],
    success: ['#f472b6', '#db2777']
  };

  const customChartTheme = {
    background: '#ffffff',
    textColor: '#333333',
    fontSize: 11,
    axis: {
      domain: {
        line: {
          stroke: '#777777',
          strokeWidth: 1
        },
      },
      ticks: {
        line: {
          stroke: '#777777',
          strokeWidth: 1
        },
        text: {
          fontSize: 12,
          fill: '#333333',
          fontWeight: 500
        },
      },
      legend: {
        text: {
          fontSize: 14,
          fill: '#333333',
          fontWeight: 600
        },
      },
    },
    grid: {
      line: {
        stroke: '#dddddd',
        strokeWidth: 1
      },
    },
    tooltip: {
      container: {
        background: 'white',
        fontSize: 13,
        boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.1)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgb(243 244 246)'
      }
    }
  };

  const revenueChartColors = {
    line: {
      stroke: '#8b5cf6',
      strokeWidth: 3
    },
    gradient: {
      stops: [
        { offset: 0, color: 'rgb(139, 92, 246, 0.3)' },
        { offset: 100, color: 'rgb(139, 92, 246, 0.01)' }
      ]
    }
  };

  const topProductsColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const pieChartColors = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6']; // Define specific colors for pie chart

  // Added responsive margins for different screen sizes
  const getChartMargins = (isMobile) => ({
    revenue: isMobile 
      ? { top: 30, right: 30, bottom: 80, left: 60 }
      : { top: 50, right: 120, bottom: 70, left: 90 },
    pie: isMobile
      ? { top: 30, right: 20, bottom: 80, left: 20 }
      : { top: 40, right: 80, bottom: 80, left: 80 },
    bar: isMobile
      ? { top: 30, right: 20, bottom: 120, left: 60 }
      : { top: 50, right: 170, bottom: 70, left: 80 }
  });

  // Add summary text generator
  const getSummaryText = (data) => {
    if (!data) return null;
    
    const completedOrders = data.orderStatus.find(s => s._id === "Completed")?.totalOrders || 0;
    const totalOrders = data.orderStatus.reduce((acc, curr) => acc + curr.totalOrders, 0) || 1;
    const successRate = (completedOrders / totalOrders * 100).toFixed(1);
    const avgOrderValue = formatCurrency(data.overview?.averageOrderValue || 0);
    const topProduct = data.topProducts[0]?.productId || 'None';
    
    return {
      overview: `In the selected period, your store generated ${formatCurrency(data.overview?.totalRevenue || 0)} from ${data.overview?.totalOrders || 0} orders.`,
      performance: `The average order value was ${avgOrderValue} with a ${successRate}% completion rate.`,
      trending: `Your top selling product (${topProduct}) accounts for ${data.topProducts[0]?.totalQuantitySold || 0} units sold.`,
      suggestion: successRate < 80 
        ? "Consider improving order fulfillment to increase completion rate."
        : "Great job maintaining a high order completion rate!"
    };
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 mt-16 bg-gradient-to-br from-gray-50 to-gray-100 font-['Lora']">
      {/* Enhanced Header Section - More responsive */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-3 flex items-center gap-3">
          <span className="bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            Analytics Dashboard
          </span>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </h1>
        <p className="text-base md:text-lg text-gray-600">Track your business performance</p>
      </div>

      {/* Enhanced Controls Section - Better mobile layout */}
      <div className="flex flex-col gap-4 mb-6 md:mb-10 bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/order/all')} 
            className="flex-1 min-w-[120px] px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm md:text-base font-medium"
          >
            Orders
          </button>
          <button 
            onClick={() => navigate('/admin/products')} 
            className="flex-1 min-w-[120px] px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 text-sm md:text-base font-medium"
          >
            Products
          </button>
          <button 
            onClick={toggleOrderStatus} 
            className={`flex-1 min-w-[120px] px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r ${
              ordersEnabled 
                ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
            } text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-sm md:text-base font-medium`}
          >
            {ordersEnabled ? 'Disable Orders' : 'Enable Orders'}
          </button>
        </div>

        {/* Date Range - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Loading State */}
      {salesLoading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading analytics data...</p>
          <p className="text-gray-400">This might take a moment</p>
        </div>
      ) : error ? (
        // Enhanced Error State
        <div className="bg-red-50/50 backdrop-blur-sm text-red-600 p-8 rounded-2xl text-center border border-red-100">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">⚠️</div>
          <p className="font-medium text-lg mb-2">Error loading analytics</p>
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      ) : !hasData ? (
        // Enhanced No Data State
        <div className="bg-gray-50/50 backdrop-blur-sm text-gray-600 p-8 rounded-2xl text-center border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">📊</div>
          <p className="font-medium text-lg mb-2">No analytics data available</p>
          <p className="text-sm text-gray-500">Try adjusting the date range or check back later</p>
        </div>
      ) : (
        <>
          {/* Add Summary Section */}
          <div className="mb-8 space-y-4">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Summary</h3>
              <div className="space-y-3 text-gray-600">
                {Object.entries(getSummaryText(salesData)).map(([key, text]) => (
                  <p key={key} className="leading-relaxed">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-8 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
              <h3 className="text-white/90 text-sm font-medium mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(salesData.overview?.totalRevenue || 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <h3 className="text-white/90 text-sm font-medium mb-1">Total Orders</h3>
              <p className="text-3xl font-bold text-white">
                {hasData ? salesData.overview.totalOrders : 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-8 rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <h3 className="text-white/90 text-sm font-medium mb-1">Average Order Value</h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(hasData ? salesData.overview.averageOrderValue : 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-8 rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
              <h3 className="text-white/90 text-sm font-medium mb-1">Success Rate</h3>
              <p className="text-3xl font-bold text-white">
                {hasData ? ((salesData.orderStatus.find(s => s._id === "Completed")?.totalOrders || 0) /
                  (salesData.orderStatus.reduce((acc, curr) => acc + curr.totalOrders, 0) || 1) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          {/* Enhanced Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white/80 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 w-full overflow-hidden">
              <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-gray-800">Revenue Trend</h3>
              <div className="h-[300px] md:h-[400px] w-full">
                {hasData && salesData.dailySales?.length > 0 ? (
                  <ResponsiveLine
                    data={[
                      {
                        id: "revenue",
                        data: salesData.dailySales.map(day => ({
                          x: day._id.date,
                          y: day.dailyRevenue || 0
                        }))
                      }
                    ]}
                    margin={getChartMargins(window.innerWidth < 768).revenue}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: window.innerWidth < 768 ? 8 : 5,
                      tickPadding: window.innerWidth < 768 ? 2 : 12,
                      tickRotation: window.innerWidth < 768 ? -65 : -45,
                      legend: 'Date',
                      legendOffset: 60, // Increased offset
                      legendPosition: 'middle'
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 8, // Increased padding
                      tickRotation: 0,
                      legend: 'Revenue (₹)',
                      legendOffset: -70, // Increased offset
                      legendPosition: 'middle',
                      format: value => formatCurrency(value)
                    }}
                    enableGridX={false}
                    gridYValues={5}
                    pointSize={8}
                    pointColor="#fff"
                    pointBorderWidth={2}
                    pointBorderColor={revenueChartColors.line.stroke}
                    pointLabelYOffset={-12}
                    enableArea={true}
                    areaBaselineValue={0}
                    areaOpacity={0.2}
                    areaBlendMode="multiply"
                    defs={[
                      {
                        id: 'gradientArea',
                        type: 'linearGradient',
                        colors: revenueChartColors.gradient.stops.map(s => ({
                          offset: s.offset,
                          color: s.color
                        }))
                      }
                    ]}
                    fill={[{ match: '*', id: 'gradientArea' }]}
                    colors={[revenueChartColors.line.stroke]}
                    lineWidth={revenueChartColors.line.strokeWidth}
                    useMesh={true}
                    enableSlices="x"
                    sliceTooltip={({ slice }) => (
                      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          {new Date(slice.points[0].data.x).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {slice.points.map(point => (
                          <div key={point.id} className="flex items-center justify-between gap-4">
                            <span className="text-gray-600">Revenue:</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(point.data.y)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    theme={customChartTheme}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white/80 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 w-full overflow-hidden">
              <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-gray-800">Order Status</h3>
              <div className="h-[300px] md:h-[400px] w-full">
                {hasData && salesData.orderStatus?.length > 0 ? (
                  <ResponsivePie
                    data={salesData.orderStatus.map(status => ({
                      id: status._id || 'Unknown',
                      label: status._id || 'Unknown',
                      value: status.totalOrders || 0
                    }))}
                    margin={getChartMargins(window.innerWidth < 768).pie}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    enableArcLinkLabels={true}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor="white"
                    colors={pieChartColors} // Use single colors definition
                    theme={customChartTheme}
                    radialLabelsSkipAngle={10}
                    radialLabelsTextXOffset={6}
                    radialLabelsLinkOffset={0}
                    radialLabelsLinkDiagonalLength={16}
                    radialLabelsLinkHorizontalLength={24}
                    radialLabelsLinkStrokeWidth={1}
                    radialLabelsLinkColor={{ from: 'color' }}
                    legends={[
                      {
                        anchor: window.innerWidth < 768 ? 'bottom' : 'right',
                        direction: window.innerWidth < 768 ? 'row' : 'column',
                        itemWidth: window.innerWidth < 768 ? 80 : 100,
                        itemHeight: window.innerWidth < 768 ? 20 : 18,
                        translateY: window.innerWidth < 768 ? 56 : 0,
                        translateX: window.innerWidth < 768 ? 0 : 60,
                      }
                    ]}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No status data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Products Chart */}
            <div className="bg-white/80 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 lg:col-span-2 w-full overflow-hidden">
              <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-gray-800">Top Products</h3>
              <div className="h-[300px] md:h-[400px] w-full">
                {hasData && salesData.topProducts?.length > 0 ? (
                  <ResponsiveBar
                    data={salesData.topProducts.map(product => ({
                      product: product.productId || 'Unknown',  // Changed from productName to productId
                      quantity: product.totalQuantitySold || 0,
                      revenue: Math.round(product.totalProductRevenue) || 0
                    }))}
                    keys={['quantity', 'revenue']}
                    indexBy="product"
                    margin={getChartMargins(window.innerWidth < 768).bar}
                    padding={0.5} // Increased padding between bars
                    groupMode="grouped"
                    valueScale={{ type: 'linear' }}
                    colors={topProductsColors}
                    borderRadius={6}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: window.innerWidth < 768 ? 8 : 5,
                      tickPadding: window.innerWidth < 768 ? 2 : 12,
                      tickRotation: window.innerWidth < 768 ? -65 : -25,
                      legend: 'Products',
                      legendPosition: 'middle',
                      legendOffset: 50 // Increased offset
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 8, // Increased padding
                      tickRotation: 0,
                      legend: 'Value',
                      legendPosition: 'middle',
                      legendOffset: -60, // Increased offset
                      format: value => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value
                    }}
                    enableLabel={false}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: window.innerWidth < 768 ? 'bottom' : 'bottom-right',
                        direction: window.innerWidth < 768 ? 'row' : 'column',
                        justify: false,
                        translateX: window.innerWidth < 768 ? 0 : 150, // Increased translation
                        translateY: window.innerWidth < 768 ? 70 : 0,
                        itemsSpacing: window.innerWidth < 768 ? 2 : 4, // Increased spacing
                        itemWidth: window.innerWidth < 768 ? 100 : 140, // Increased width
                        itemHeight: window.innerWidth < 768 ? 20 : 24, // Increased height
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        symbolShape: 'circle',
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemOpacity: 1,
                              symbolSize: 25,
                              itemBackground: 'rgba(255, 255, 255, .2)'
                            }
                          }
                        ]
                      }
                    ]}
                    tooltip={({ id, value, color, indexValue }) => (
                      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                        <div className="text-sm font-medium text-gray-900 mb-2">{indexValue}</div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-gray-600">{id}:</span>
                          <span className="font-semibold text-gray-900">
                            {id === 'revenue' ? formatCurrency(value) : value}
                          </span>
                        </div>
                      </div>
                    )}
                    theme={customChartTheme}
                    animate={true}
                    motionConfig="gentle"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No product data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
