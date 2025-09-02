"use client";

import { useState, useMemo, useCallback } from 'react';
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
import { OperationalItem } from './DailyItemsCard';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'month' | 'week' | 'day';

// Helper to get a color based on item type for badges
const getTypeColor = (type: OperationalItem['type']): string => {
  switch (type) {
    case 'Project': return 'bg-blue-500';
    case 'Task': return 'bg-green-500';
    case 'Timeline Event': return 'bg-purple-500';
    case 'Invoice': return 'bg-orange-500';
    case 'Subscription': return 'bg-pink-500';
    case 'Feature Request': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

// FIX: Helper function to compare dates using UTC date strings
const isSameDayUTC = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1).toLocaleDateString('en-US', { timeZone: 'UTC' });
  const d2 = new Date(date2).toLocaleDateString('en-US', { timeZone: 'UTC' });
  return d1 === d2;
};

// Draggable Item Component
function DraggableItem({ item, isDragging = false }: { item: OperationalItem, isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Badge
        className={`w-full text-left justify-start truncate cursor-grab active:cursor-grabbing text-[10px] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5 ${getTypeColor(item.type)}`}
      >
        <span className="truncate">{item.title}</span>
      </Badge>
    </div>
  );
}

// Droppable Day Component
function DroppableDay({ date, items, isCurrentMonth, isCurrentDay, onItemClick, viewMode = 'month' }: {
  date: Date;
  items: OperationalItem[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  onItemClick: (item: OperationalItem) => void;
  viewMode?: 'month' | 'week';
}) {
  const dayId = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({
    id: dayId,
  });

  // Adjust height based on view mode
  const heightClasses = viewMode === 'week' 
    ? 'min-h-[120px] sm:min-h-[150px] md:min-h-[180px]'
    : 'h-20 sm:h-28 md:h-32';

  return (
    <div
      ref={setNodeRef}
      className={`
        p-1 sm:p-2 flex flex-col
        ${heightClasses}
        transition-colors
        border rounded-lg shadow-sm
        ${!isCurrentMonth ? 'bg-muted/50 border-muted' : 'bg-card border-border'}
        ${isCurrentDay ? 'border-2 border-primary' : ''}
        ${isOver ? 'bg-primary/10 border-2 border-primary' : ''}
      `}
      data-day={dayId}
    >
      {/* Show day number only in month view */}
      {viewMode === 'month' && (
        <div className="flex justify-between items-center mb-1">
          <span className={`font-semibold text-xs sm:text-sm ${!isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}`}>
            {format(date, 'd')}
          </span>
        </div>
      )}
      
      <div className="overflow-y-auto space-y-0.5 sm:space-y-1 flex-grow scrollbar-thin">
        <SortableContext items={items.map(item => item.id)}>
          {/* Show more items in week view */}
          {items.slice(0, viewMode === 'week' ? 6 : 3).map(item => (
            <div key={item.id} onClick={() => onItemClick(item)} className="cursor-pointer">
              <DraggableItem item={item} />
            </div>
          ))}
        </SortableContext>
        {/* Adjust the "more" indicator based on view mode */}
        {((viewMode === 'week' && items.length > 6) || (viewMode === 'month' && items.length > 3)) && (
          <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
            +{items.length - (viewMode === 'week' ? 6 : 3)} more
          </div>
        )}
      </div>
    </div>
  );
}

export default function InteractiveCalendar({ allItems }: { allItems: OperationalItem[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [items, setItems] = useState(allItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  // Update items when allItems prop changes
  useMemo(() => {
    setItems(allItems);
  }, [allItems]);

  // API call functions for updating items
  const updateItemDate = async (item: OperationalItem, newDate: Date) => {
    const dateString = newDate.toISOString();
    
    try {
      let endpoint = '';
      let dateField = '';
      
      switch (item.type) {
        case 'Project':
          endpoint = `/api/projects/${item.id}`;
          dateField = 'endDate';
          break;
        case 'Task':
          endpoint = `/api/tasks/${item.id}`;
          dateField = 'dueDate';
          break;
        case 'Timeline Event':
          endpoint = `/api/timeline-events/${item.id}`;
          dateField = 'eventDate';
          break;
        case 'Invoice':
          endpoint = `/api/invoices/${item.id}`;
          dateField = 'dueDate';
          break;
        case 'Feature Request':
          const featureId = item.id.startsWith('feature-') ? item.id.replace('feature-', '') : item.id;
          endpoint = `/api/feature-requests/${featureId}`;
          dateField = 'dueDate';
          break;
        default:
          throw new Error(`Unknown item type: ${item.type}`);
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [dateField]: dateString }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${item.type.toLowerCase()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeItem = items.find(item => item.id === active.id);
    if (!activeItem) return;

    // The over.id is already the day string (yyyy-mm-dd format)
    const targetDateString = over.id as string;
    const targetDate = new Date(targetDateString + 'T00:00:00.000Z');
    
    // Optimistic update
    const updatedItems = items.map(item => 
      item.id === active.id ? { ...item, dueDate: targetDate } : item
    );
    setItems(updatedItems);

    try {
      await updateItemDate(activeItem, targetDate);
      toast({
        title: "Item moved successfully",
        description: `${activeItem.title} moved to ${format(targetDate, 'MMM d, yyyy')}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setItems(items);
      toast({
        title: "Failed to move item",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }, [items, toast]);

  const handleItemClick = useCallback((item: OperationalItem) => {
    // Navigate to the item's detail page
    window.open(item.link, '_blank');
  }, []);

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
      // Month view with drag and drop
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
            {/* Calendar grid with drag and drop */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const itemsForDay = items.filter(item => isSameDayUTC(item.dueDate, day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const dayId = format(day, 'yyyy-MM-dd');

                return (
                  <DroppableDay
                    key={day.toString()}
                    date={day}
                    items={itemsForDay}
                    isCurrentMonth={isCurrentMonth}
                    isCurrentDay={isCurrentDay}
                    onItemClick={handleItemClick}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          </div>
        </div>
      );
    } else if (viewMode === 'week') {
      // Week view with drag and drop
      return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const itemsForDay = items.filter(item => isSameDayUTC(item.dueDate, day));
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div key={day.toString()} className="flex flex-col">
                {/* Day header for week view */}
                <div className="mb-2 text-center">
                  <div className="font-semibold text-sm">{format(day, 'd')}</div>
                  <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                </div>
                
                {/* Droppable day container */}
                <DroppableDay
                  date={day}
                  items={itemsForDay}
                  isCurrentMonth={isCurrentMonth}
                  isCurrentDay={isCurrentDay}
                  onItemClick={handleItemClick}
                  viewMode={viewMode}
                />
              </div>
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
  
  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
      
      <DragOverlay>
        {activeItem ? (
          <DraggableItem item={activeItem} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}