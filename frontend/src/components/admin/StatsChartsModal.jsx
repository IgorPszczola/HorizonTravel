import React from 'react';

function StatsChartsModal({
  showChartsModal,
  setShowChartsModal,
  chartsActiveTab,
  setChartsActiveTab,
  statsRevenue,
  statsPopular,
  hoveredData,
  setHoveredData
}) {
  if (!showChartsModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowChartsModal(false)}>
      <div className="modal-content large animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <button className="modal-close-btn" onClick={() => setShowChartsModal(false)}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div style={{ padding: '24px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.3rem' }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Interaktywne Wykresy Statystyk</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Wizualizacja graficzna wyników finansowych oraz popularności kierunków</p>
            </div>
          </div>

          {/* Tabs Inside Modal */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '25px', gap: '10px' }}>
            <button 
              className={`tab-btn ${chartsActiveTab === 'revenue' ? 'active' : ''}`}
              onClick={() => setChartsActiveTab('revenue')}
              style={{ padding: '12px 20px', fontSize: '0.9rem', background: 'transparent', border: 'none', borderBottom: chartsActiveTab === 'revenue' ? '2px solid var(--primary)' : 'none', color: chartsActiveTab === 'revenue' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
            >
              <i className="fa-solid fa-sack-dollar"></i> Wykres Przychodów (Miesięczny)
            </button>
            <button 
              className={`tab-btn ${chartsActiveTab === 'popularity' ? 'active' : ''}`}
              onClick={() => setChartsActiveTab('popularity')}
              style={{ padding: '12px 20px', fontSize: '0.9rem', background: 'transparent', border: 'none', borderBottom: chartsActiveTab === 'popularity' ? '2px solid var(--primary)' : 'none', color: chartsActiveTab === 'popularity' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
            >
              <i className="fa-solid fa-fire"></i> Popularność Kierunków (Donut)
            </button>
          </div>

          {/* Tab Content: Revenue Line Chart */}
          {chartsActiveTab === 'revenue' && (() => {
            const maxRev = Math.max(...statsRevenue.map(r => r.revenue), 1000);
            const monthsAbbrev = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
            const monthsFull = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
            
            const svgW = 680;
            const svgH = 300;
            const marginL = 70;
            const marginR = 20;
            const marginT = 30;
            const marginB = 40;
            
            const plotW = svgW - marginL - marginR;
            const plotH = svgH - marginT - marginB;
            
            const points = Array.from({ length: 12 }).map((_, i) => {
              const x = marginL + i * (plotW / 11);
              const record = statsRevenue.find(r => r.month === i + 1);
              const val = record ? record.revenue : 0;
              const y = (svgH - marginB) - (val / maxRev) * plotH;
              return { x, y, val, month: monthsFull[i], abbrev: monthsAbbrev[i] };
            });
            
            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const areaPath = `${linePath} L ${points[11].x} ${svgH - marginB} L ${points[0].x} ${svgH - marginB} Z`;
            
            return (
              <div style={{ textAlign: 'center' }}>
                <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Horizontal Grid Lines */}
                  {Array.from({ length: 5 }).map((_, j) => {
                    const yVal = (svgH - marginB) - (j / 4) * plotH;
                    const labelVal = Math.round((maxRev * (j / 4)));
                    return (
                      <g key={j}>
                        <line 
                          x1={marginL} 
                          y1={yVal} 
                          x2={svgW - marginR} 
                          y2={yVal} 
                          stroke="var(--border-color)" 
                          strokeWidth={1}
                          strokeDasharray={j === 0 ? 'none' : '4 4'}
                        />
                        <text 
                          x={marginL - 10} 
                          y={yVal + 4} 
                          textAnchor="end" 
                          fill="var(--text-muted)" 
                          fontSize="10px"
                        >
                          {labelVal.toLocaleString()} zł
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Vertical grid lines (for months) */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <line 
                        x1={p.x} 
                        y1={marginT} 
                        x2={p.x} 
                        y2={svgH - marginB} 
                        stroke="var(--border-color)" 
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        opacity={0.3}
                      />
                      <text 
                        x={p.x} 
                        y={svgH - marginB + 20} 
                        textAnchor="middle" 
                        fill="var(--text-secondary)" 
                        fontSize="11px"
                        fontWeight="500"
                      >
                        {p.abbrev}
                      </text>
                    </g>
                  ))}
                  
                  {/* Area Fill */}
                  <path d={areaPath} fill="url(#areaGrad)" />
                  
                  {/* Stroke Line */}
                  <path d={linePath} fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Interactive Circles */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r={5} 
                        fill="#10b981" 
                        stroke="var(--panel-bg)" 
                        strokeWidth={2.5} 
                      />
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r={18} 
                        fill="transparent" 
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const rect = e.target.getBoundingClientRect();
                          setHoveredData({
                            type: 'revenue',
                            x: rect.left,
                            y: rect.top - 15,
                            label: p.month,
                            value: p.val
                          });
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                      />
                    </g>
                  ))}
                </svg>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '15px' }}>
                  <i className="fa-solid fa-circle-info"></i> Najedź kursorem na punkty wykresu, aby zobaczyć dokładne kwoty przychodu.
                </p>
              </div>
            );
          })()}

          {/* Tab Content: Popularity Donut Chart */}
          {chartsActiveTab === 'popularity' && (() => {
            const totalParticipants = statsPopular.reduce((acc, curr) => acc + curr.totalParticipants, 0);
            const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
            
            if (totalParticipants === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <i className="fa-solid fa-folder-open fa-3x" style={{ marginBottom: '15px', color: 'var(--text-muted)' }}></i>
                  <p>Brak uczestników do wygenerowania wykresu popularności.</p>
                </div>
              );
            }
            
            let currentAngle = -Math.PI / 2;
            const cx = 150;
            const cy = 150;
            const r = 95;
            const ir = 55;
            
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <svg width="300" height="300" viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
                    {statsPopular.map((item, idx) => {
                      const percentage = item.totalParticipants / totalParticipants;
                      const angleSize = percentage * 2 * Math.PI;
                      const adjustedAngleSize = angleSize >= 2 * Math.PI ? 2 * Math.PI - 0.001 : angleSize;
                      
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + adjustedAngleSize;
                      currentAngle = endAngle;
                      
                      const x1 = cx + r * Math.cos(startAngle);
                      const y1 = cy + r * Math.sin(startAngle);
                      const x2 = cx + r * Math.cos(endAngle);
                      const y2 = cy + r * Math.sin(endAngle);
                      
                      const xi1 = cx + ir * Math.cos(startAngle);
                      const yi1 = cy + ir * Math.sin(startAngle);
                      const xi2 = cx + ir * Math.cos(endAngle);
                      const yi2 = cy + ir * Math.sin(endAngle);
                      
                      const largeArc = adjustedAngleSize > Math.PI ? 1 : 0;
                      
                      const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ir} ${ir} 0 ${largeArc} 0 ${xi1} ${yi1} Z`;
                      const color = colors[idx % colors.length];
                      
                      return (
                        <g key={item.tripId}>
                          <path 
                            d={pathData} 
                            fill={color} 
                            stroke="var(--panel-bg)" 
                            strokeWidth={2}
                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            opacity={hoveredData && hoveredData.label !== item.title ? 0.6 : 1}
                            onMouseEnter={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setHoveredData({
                                type: 'popularity',
                                x: rect.left + rect.width / 2,
                                y: rect.top - 10,
                                label: item.title,
                                bookings: item.bookingsCount,
                                participants: item.totalParticipants
                              });
                            }}
                            onMouseLeave={() => setHoveredData(null)}
                          />
                        </g>
                      );
                    })}
                    {/* Middle text */}
                    <circle cx={cx} cy={cy} r={ir - 1} fill="var(--panel-bg)" />
                    <text x={cx} y={cy - 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="11px" fontWeight="500">Suma uczestników</text>
                    <text x={cx} y={cy + 15} textAnchor="middle" fill="var(--text-primary)" fontSize="20px" fontWeight="700">{totalParticipants}</text>
                  </svg>
                </div>
                
                {/* Legend */}
                <div>
                  <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Kierunki i Udział w Sprzedaży</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {statsPopular.map((item, idx) => {
                      const percentage = Math.round((item.totalParticipants / totalParticipants) * 100);
                      const color = colors[idx % colors.length];
                      return (
                        <div 
                          key={item.tripId} 
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', padding: '6px 10px', borderRadius: '6px', background: hoveredData && hoveredData.label === item.title ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'background 0.2s' }}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, flexShrink: 0 }}></div>
                          <div style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{item.title}</div>
                          <div style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{percentage}% ({item.totalParticipants} os.)</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default StatsChartsModal;
