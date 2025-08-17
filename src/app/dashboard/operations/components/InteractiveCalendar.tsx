"use client";

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { OperationalItem } from './DailyItemsCard'; // Assuming type is exported from here

type ViewMode = 'month' | 'week' | 'day';

// Helper to get a color based on item type for badges
const getTypeColor = (type: OperationalItem['type']): string => {
  switch (type) {
    case 'Project': return 'bg-blue-500';
    case 'Task': return 'bg-green-500';
    case 'Timeline Event': return 'bg-purple-500';
    case 'Invoice': return 'bg-yellow-500 text-black';
    case 'Client Contract': return 'bg-pink-500';
    default: return 'bg-gray-500';
  }
};

export default function InteractiveCalendar({ allItems }: { allItems: OperationalItem[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = useMemo(() => {
    const start = viewMode === 'month' ? startOfWeek(startOfMonth(currentDate)) :
                  viewMode === 'week' ? startOfWeek(currentDate) :
                  currentDate;
    const end = viewMode === 'month' ? endOfWeek(endOfMonth(currentDate)) :
                viewMode === 'week' ? endOfWeek(currentDate) :
                currentDate;

    return eachDayOfInterval({ start, end });
  }, [currentDate, viewMode]);

  const headerTitle = useMemo(() => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy');
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'EEEE, MMMM d, yyyy');
  }, [currentDate, viewMode]);

  const renderGrid = () => {
    const gridClasses = {
      month: 'grid grid-cols-7 gap-1',
      week: 'grid grid-cols-1 md:grid-cols-7 gap-2',
      day: 'grid grid-cols-1 gap-4'
    };

    return (
      <div className={gridClasses[viewMode]}>
        {viewMode === 'month' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">{day}</div>
        ))}
        {calendarDays.map((day) => {
          const itemsForDay = allItems.filter(item => isSameDay(item.dueDate, day));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <Card
              key={day.toString()}
              className={`
                p-2 flex flex-col
                ${viewMode === 'month' ? 'h-32' : 'min-h-[150px]'}
                ${!isCurrentMonth && viewMode === 'month' ? 'bg-muted/50' : 'bg-card'}
                ${isCurrentDay ? 'border-2 border-primary' : ''}
              `}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold text-sm ${!isCurrentMonth && viewMode === 'month' ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </span>
                {viewMode !== 'month' && <span className="text-sm text-muted-foreground">{format(day, 'EEE')}</span>}
              </div>
              <div className="overflow-y-auto space-y-1 flex-grow">
                {itemsForDay.map(item => (
                  <Link href={item.link} key={item.id}>
                    <Badge
                      className={`w-full text-left justify-start truncate cursor-pointer hover:opacity-80 ${getTypeColor(item.type)}`}
                    >
                      {item.title}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="text-lg font-semibold text-center w-48">{headerTitle}</h3>
            <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={handleToday}>Today</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'month' ? 'default' : 'outline'} onClick={() => setViewMode('month')}>Month</Button>
            <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')}>Week</Button>
            <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')}>Day</Button>
          </div>
        </div>
        {renderGrid()}
      </CardContent>
    </Card>
  );
}
