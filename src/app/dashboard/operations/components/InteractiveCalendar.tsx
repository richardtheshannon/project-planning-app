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
    case 'Invoice': return 'bg-orange-500';
    case 'Subscription': return 'bg-pink-500';
    case 'Client Contract': return 'bg-teal-500';
    case 'Feature Request': return 'bg-yellow-500'; // Added Feature Request color
    default: return 'bg-gray-500';
  }
};

// FIX: Helper function to compare dates using UTC date strings
const isSameDayUTC = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1).toLocaleDateString('en-US', { timeZone: 'UTC' });
  const d2 = new Date(date2).toLocaleDateString('en-US', { timeZone: 'UTC' });
  return d1 === d2;
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
    if (viewMode === 'month') {
      // Month view with horizontal scroll on mobile
      return (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-xs sm:text-sm text-muted-foreground p-1 sm:p-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const itemsForDay = allItems.filter(item => isSameDayUTC(item.dueDate, day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <Card
                    key={day.toString()}
                    className={`
                      p-1 sm:p-2 flex flex-col
                      h-20 sm:h-28 md:h-32
                      ${!isCurrentMonth ? 'bg-muted/50' : 'bg-card'}
                      ${isCurrentDay ? 'border-2 border-primary' : ''}
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold text-xs sm:text-sm ${!isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="overflow-y-auto space-y-0.5 sm:space-y-1 flex-grow scrollbar-thin">
                      {itemsForDay.slice(0, 3).map(item => (
                        <Link href={item.link} key={item.id}>
                          <Badge
                            className={`w-full text-left justify-start truncate cursor-pointer hover:opacity-80 text-[10px] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5 ${getTypeColor(item.type)}`}
                          >
                            <span className="truncate">{item.title}</span>
                          </Badge>
                        </Link>
                      ))}
                      {itemsForDay.length > 3 && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
                          +{itemsForDay.length - 3} more
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else if (viewMode === 'week') {
      // Week view
      return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const itemsForDay = allItems.filter(item => isSameDayUTC(item.dueDate, day));
            const isCurrentDay = isToday(day);

            return (
              <Card
                key={day.toString()}
                className={`
                  p-2 sm:p-3 flex flex-col
                  min-h-[120px] sm:min-h-[150px]
                  ${isCurrentDay ? 'border-2 border-primary' : ''}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">{format(day, 'd')}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{format(day, 'EEE')}</span>
                </div>
                <div className="overflow-y-auto space-y-1 flex-grow">
                  {itemsForDay.map(item => (
                    <Link href={item.link} key={item.id}>
                      <Badge
                        className={`w-full text-left justify-start truncate cursor-pointer hover:opacity-80 text-xs ${getTypeColor(item.type)}`}
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
    } else {
      // Day view
      const itemsForDay = allItems.filter(item => isSameDayUTC(item.dueDate, currentDate));
      const isCurrentDay = isToday(currentDate);

      return (
        <Card className={`p-4 ${isCurrentDay ? 'border-2 border-primary' : ''}`}>
          <div className="space-y-2">
            {itemsForDay.length > 0 ? (
              itemsForDay.map(item => (
                <Link href={item.link} key={item.id}>
                  <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Badge className={`mb-2 ${getTypeColor(item.type)}`}>
                      {item.type}
                    </Badge>
                    <p className="font-semibold">{item.title}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No items scheduled for this day.</p>
            )}
          </div>
        </Card>
      );
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-3 sm:p-4">
        {/* Header with navigation */}
        <div className="flex flex-col space-y-3 mb-4">
          {/* Date navigation */}
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h3 className="text-sm sm:text-lg font-semibold text-center min-w-[140px] sm:min-w-[200px]">
              {headerTitle}
            </h3>
            <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleToday}
              className="h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm"
            >
              Today
            </Button>
          </div>
          
          {/* View mode switcher */}
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button 
              variant={viewMode === 'month' ? 'default' : 'outline'} 
              onClick={() => setViewMode('month')}
              className="h-8 px-2 sm:h-9 sm:px-4 text-xs sm:text-sm"
            >
              Month
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'default' : 'outline'} 
              onClick={() => setViewMode('week')}
              className="h-8 px-2 sm:h-9 sm:px-4 text-xs sm:text-sm"
            >
              Week
            </Button>
            <Button 
              variant={viewMode === 'day' ? 'default' : 'outline'} 
              onClick={() => setViewMode('day')}
              className="h-8 px-2 sm:h-9 sm:px-4 text-xs sm:text-sm"
            >
              Day
            </Button>
          </div>
        </div>
        
        {/* Calendar grid */}
        {renderGrid()}
      </CardContent>
    </Card>
  );
}