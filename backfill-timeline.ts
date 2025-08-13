// backfill-timeline.ts
import { PrismaClient } from '@prisma/client';
import { defaultTimelineEvents } from './timeline-template';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill script...');

  // 1. Find all projects.
  const allProjects = await prisma.project.findMany({
    include: {
      // Include a count of timeline events for each project.
      _count: {
        select: { timelineEvents: true },
      },
    },
  });

  // 2. Filter to find projects that have zero timeline events.
  const projectsWithoutTimeline = allProjects.filter(
    (p) => p._count.timelineEvents === 0
  );

  if (projectsWithoutTimeline.length === 0) {
    console.log('All projects already have a timeline. No action needed.');
    return;
  }

  console.log(`Found ${projectsWithoutTimeline.length} project(s) to update.`);

  // 3. For each project, create the default timeline events.
  for (const project of projectsWithoutTimeline) {
    console.log(`- Adding timeline to project: "${project.name}" (ID: ${project.id})`);
    
    const timelineEventsToCreate = defaultTimelineEvents.map(event => ({
      ...event,
      projectId: project.id,
    }));

    await prisma.timelineEvent.createMany({
      data: timelineEventsToCreate,
    });

    console.log(`  ... Done.`);
  }

  console.log('Backfill script completed successfully!');
}

main()
  .catch((e) => {
    console.error('An error occurred during the backfill process:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
//