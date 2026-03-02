import { Note } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from './ThemeProvider';

interface NoteDiagramProps {
  topNotes: Note[];
  heartNotes: Note[];
  baseNotes: Note[];
}

export default function NoteDiagram({ topNotes, heartNotes, baseNotes }: NoteDiagramProps) {
  const { theme } = useTheme();
  
  const colors = theme === 'dark' ? {
    top: '#57534e', // stone-600
    heart: '#78716c', // stone-500
    base: '#a8a29e', // stone-400
  } : {
    top: '#d6d3d1', // stone-300
    heart: '#a8a29e', // stone-400
    base: '#78716c', // stone-500
  };

  const data = [
    { name: 'Top Notes', value: topNotes.reduce((acc, curr) => acc + curr.value, 0), color: colors.top },
    { name: 'Heart Notes', value: heartNotes.reduce((acc, curr) => acc + curr.value, 0), color: colors.heart },
    { name: 'Base Notes', value: baseNotes.reduce((acc, curr) => acc + curr.value, 0), color: colors.base },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex items-center gap-4 h-32">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={45}
              innerRadius={20}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: theme === 'dark' ? '#1c1917' : '#ffffff',
                color: theme === 'dark' ? '#f5f5f4' : '#1c1917'
              }}
              itemStyle={{ color: theme === 'dark' ? '#f5f5f4' : '#444' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-1/2 flex flex-col justify-center gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.top }}></div>
          <span className="text-stone-600 dark:text-stone-400 truncate" title={topNotes.map(n => n.name).join(', ')}>
            Top: {topNotes.map(n => n.name).join(', ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.heart }}></div>
          <span className="text-stone-600 dark:text-stone-400 truncate" title={heartNotes.map(n => n.name).join(', ')}>
            Heart: {heartNotes.map(n => n.name).join(', ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.base }}></div>
          <span className="text-stone-600 dark:text-stone-400 truncate" title={baseNotes.map(n => n.name).join(', ')}>
            Base: {baseNotes.map(n => n.name).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
}
