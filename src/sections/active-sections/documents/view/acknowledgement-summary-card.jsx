import { CONFIG } from 'src/config-global';

import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

export function AcknowledgementSummaryCard({ title, total, color, icon }) {
    const iconSrc = `${CONFIG.site.basePath}/assets/icons/navbar/${icon}.svg`;

    return <CourseWidgetSummary title={title} total={total} color={color} icon={iconSrc} />;
}