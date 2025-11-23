import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      stepsToReproduce,
      severity,
      userEmail,
      userName,
      userRole,
      pageUrl,
      browser
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const developerEmail = process.env.BUG_REPORT_EMAIL || 'jcapones93@gmail.com';

    // Format the email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">
          🐛 Bug Report: ${title}
        </h2>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Severity:</strong>
            <span style="color: ${
              severity === 'critical' ? '#EF4444' :
              severity === 'high' ? '#F59E0B' :
              severity === 'medium' ? '#3B82F6' : '#10B981'
            }; font-weight: bold;">
              ${severity?.toUpperCase() || 'NOT SPECIFIED'}
            </span>
          </p>
        </div>

        <h3 style="color: #374151;">Description</h3>
        <p style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #2563EB;">
          ${description}
        </p>

        ${stepsToReproduce ? `
          <h3 style="color: #374151;">Steps to Reproduce</h3>
          <p style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
            ${stepsToReproduce}
          </p>
        ` : ''}

        <h3 style="color: #374151;">Reporter Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userName || 'Anonymous'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userEmail || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Role:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userRole || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Page URL:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${pageUrl || 'Not captured'}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Browser:</strong></td>
            <td style="padding: 8px;">${browser || 'Not detected'}</td>
          </tr>
        </table>

        <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">
          This bug report was submitted from Southville 8B NHS Edge Portal
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Southville Bug Report <onboarding@resend.dev>',
      to: [developerEmail],
      subject: `[Bug Report] ${severity?.toUpperCase() || 'NEW'}: ${title}`,
      html: emailHtml,
      replyTo: userEmail || undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Bug report sent successfully', id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bug report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
