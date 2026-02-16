

import prisma from 'lib/prisma';

export interface TemplateVariables {
    [key: string]: string | number;
}

export interface NotificationTemplate {
    id: string;
    template_key: string;
    template_name: string;
    title: string;
    message_template: string;
    description: string | null;
    variables: any;
    is_active: boolean;
}

/**
 * Get template by key
 */
export async function getTemplateByKey(templateKey: string): Promise<NotificationTemplate | null> {
    try {
        const template = await (prisma as any).notificationTemplate.findUnique({
            where: {
                template_key: templateKey,
                is_active: true
            }
        });

        return template;
    } catch (error) {
        console.error('Error fetching template:', error);
        return null;
    }
}

/**
 * Render template dengan variables
 * Mengganti placeholder {variable_name} dengan nilai dari variables object
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
    let rendered = template;

    Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return rendered;
}

/**
 * Format pesan attendance reminder menggunakan template dari database
 */
export async function formatAttendanceNotificationFromTemplate(
    supervisorName: string,
    absentInterns: Array<{ intern_name: string; unit_name: string }>
): Promise<{ title: string; message: string } | null> {
    try {
        // Get template dari database
        const template = await getTemplateByKey('attendance_reminder');

        if (!template) {
            console.warn('Template not found, using default');
            return null;
        }

        // Format intern list
        const internList = absentInterns
            .map((intern, index) => `${index + 1}. <b>${intern.intern_name}</b> (${intern.unit_name})`)
            .join('\n');

        // Prepare variables
        const variables: TemplateVariables = {
            supervisor_name: supervisorName,
            intern_list: internList,
            absent_count: absentInterns.length,
            timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        };

        // Render template
        const renderedMessage = renderTemplate(template.message_template, variables);
        const renderedTitle = renderTemplate(template.title, variables);

        return {
            title: renderedTitle,
            message: renderedMessage
        };
    } catch (error) {
        console.error('Error formatting notification from template:', error);
        return null;
    }
}

/**
 * Get all templates
 */
export async function getAllTemplates() {
    try {
        const templates = await (prisma as any).notificationTemplate.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return templates;
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
}

/**
 * Get active templates only
 */
export async function getActiveTemplates() {
    try {
        const templates = await (prisma as any).notificationTemplate.findMany({
            where: {
                is_active: true
            },
            orderBy: {
                template_name: 'asc'
            }
        });

        return templates;
    } catch (error) {
        console.error('Error fetching active templates:', error);
        return [];
    }
}

/**
 * Preview template dengan sample data
 */
export function previewTemplate(
    template: string,
    sampleVariables: TemplateVariables
): string {
    return renderTemplate(template, sampleVariables);
}
