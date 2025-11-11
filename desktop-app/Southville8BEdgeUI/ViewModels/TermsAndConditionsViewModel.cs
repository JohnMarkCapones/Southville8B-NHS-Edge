using System;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.DependencyInjection;
using Southville8BEdgeUI;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels;

public partial class TermsAndConditionsViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _selectedRole = "Admin";

    [ObservableProperty]
    private string _adminTermsContent = @"SOUTHVILLE 8B NATIONAL HIGH SCHOOL - CAMPUSCONNECT
TERMS AND CONDITIONS FOR ADMINISTRATORS

Last Updated: January 2025

1. ACCEPTANCE OF TERMS
By accessing and using the CampusConnect platform as an Administrator, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use the platform.

2. ADMINISTRATOR RESPONSIBILITIES
2.1. Account Security
- You are responsible for maintaining the confidentiality of your login credentials.
- You must immediately report any unauthorized access to your account.
- You are prohibited from sharing your account credentials with any other person.

2.2. Data Management
- You are responsible for the accuracy and integrity of all data you enter into the system.
- You must ensure compliance with data protection regulations when handling student and staff information.
- You are required to maintain backups of critical data as per school policy.

2.3. User Management
- You have the authority to create, modify, and deactivate user accounts within your designated scope.
- You must ensure that user accounts are created only for authorized individuals.
- You are responsible for maintaining accurate user information and roles.

3. SYSTEM ACCESS AND USAGE
3.1. Authorized Use
- The platform is to be used solely for official school administrative purposes.
- You may not use the system for personal gain or unauthorized activities.
- Access to sensitive information must be limited to what is necessary for your role.

3.2. Prohibited Activities
- Unauthorized access to other users' accounts or data
- Modification of system settings without proper authorization
- Distribution of confidential information outside authorized channels
- Use of automated scripts or tools that may compromise system security

4. DATA PRIVACY AND CONFIDENTIALITY
4.1. Student Information
- You must comply with all applicable privacy laws and regulations (e.g., Data Privacy Act of 2012).
- Student records are confidential and may only be accessed for legitimate educational purposes.
- You must not disclose student information to unauthorized parties.

4.2. Staff Information
- Employee information must be handled with the same level of confidentiality as student data.
- Access to staff records must be limited to authorized personnel only.

5. SYSTEM MAINTENANCE AND UPDATES
5.1. Scheduled Maintenance
- The system may undergo scheduled maintenance, during which access may be temporarily unavailable.
- You will be notified of planned maintenance activities in advance when possible.

5.2. Updates and Changes
- The school reserves the right to modify, update, or discontinue features of the platform.
- You will be notified of significant changes that affect your use of the system.

6. INTELLECTUAL PROPERTY
6.1. Platform Ownership
- All content, features, and functionality of CampusConnect are the property of Southville 8B National High School.
- You may not copy, modify, or distribute any part of the platform without written authorization.

7. LIABILITY AND DISCLAIMERS
7.1. System Availability
- The school does not guarantee uninterrupted or error-free operation of the platform.
- The school is not liable for any loss of data or system downtime.

7.2. Data Accuracy
- While the school strives to maintain accurate data, you are responsible for verifying critical information.
- The school is not liable for decisions made based on inaccurate data entered by users.

8. TERMINATION OF ACCESS
8.1. Violation of Terms
- Violation of these terms may result in immediate suspension or termination of your access.
- The school reserves the right to investigate any suspected violations.

8.2. End of Employment
- Your access to the platform will be terminated upon the end of your employment or administrative role.
- You must return all school property and cease using the platform immediately.

9. COMPLIANCE AND AUDITING
9.1. Audit Logs
- All administrative actions are logged and may be reviewed for compliance purposes.
- You consent to the monitoring of your system usage for security and compliance purposes.

10. CONTACT INFORMATION
For questions or concerns regarding these Terms and Conditions, please contact:
- IT Department: it-support@southville.edu.ph
- School Administration: admin@southville.edu.ph

11. ACKNOWLEDGMENT
By using CampusConnect as an Administrator, you acknowledge that:
- You have read and understood these Terms and Conditions
- You agree to comply with all applicable laws and regulations
- You understand the consequences of violating these terms
- You will maintain the confidentiality and security of all information you access

I agree to these Terms and Conditions.";

    [ObservableProperty]
    private string _teacherTermsContent = @"SOUTHVILLE 8B NATIONAL HIGH SCHOOL - CAMPUSCONNECT
TERMS AND CONDITIONS FOR TEACHERS

Last Updated: January 2025

1. ACCEPTANCE OF TERMS
By accessing and using the CampusConnect platform as a Teacher, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use the platform.

2. TEACHER RESPONSIBILITIES
2.1. Account Security
- You are responsible for maintaining the confidentiality of your login credentials.
- You must immediately report any unauthorized access to your account.
- You are prohibited from sharing your account credentials with students or unauthorized persons.

2.2. Professional Conduct
- You must use the platform in a professional manner consistent with your role as an educator.
- You are expected to maintain appropriate boundaries when communicating with students through the platform.
- All communications must be professional and related to educational purposes.

2.3. Academic Integrity
- You are responsible for maintaining accurate academic records for your students.
- Grades and assessments must be entered promptly and accurately.
- You must ensure fairness and consistency in grading practices.

3. SYSTEM ACCESS AND USAGE
3.1. Authorized Use
- The platform is to be used solely for official educational and administrative purposes.
- You may access student information only for students under your instruction or supervision.
- You may not use the system for personal activities unrelated to your teaching duties.

3.2. Prohibited Activities
- Accessing information about students not under your instruction without authorization
- Sharing student information with unauthorized parties
- Using the platform to engage in activities unrelated to teaching
- Posting inappropriate content or communications

4. STUDENT INFORMATION AND PRIVACY
4.1. Confidentiality
- Student records are confidential and protected by privacy laws.
- You may only access student information for legitimate educational purposes.
- You must not disclose student information to unauthorized parties, including other students or parents without proper authorization.

4.2. FERPA Compliance
- You must comply with the Family Educational Rights and Privacy Act (FERPA) and similar regulations.
- Student grades and personal information must be kept confidential.
- Parent access to student information must be handled according to school policy.

5. GRADING AND ASSESSMENT
5.1. Grade Entry
- You are responsible for entering grades accurately and in a timely manner.
- Grades must reflect actual student performance and be based on established criteria.
- You must maintain records of all assessments and grading decisions.

5.2. Academic Records
- You must ensure the accuracy of all academic records you maintain in the system.
- Corrections to grades must be documented and approved according to school policy.

6. COMMUNICATION GUIDELINES
6.1. Student Communication
- All communications with students through the platform must be professional and educational in nature.
- You must maintain appropriate boundaries in all interactions.
- Communications must comply with school policies regarding teacher-student interactions.

6.2. Parent Communication
- Parent communications must be professional and respectful.
- You must follow school policies regarding parent contact and information sharing.

7. INTELLECTUAL PROPERTY
7.1. Educational Materials
- Materials you create and upload to the platform remain your intellectual property, subject to school policies.
- The school may use materials uploaded to the platform for educational purposes.

7.2. Platform Ownership
- All content, features, and functionality of CampusConnect are the property of Southville 8B National High School.
- You may not copy, modify, or distribute any part of the platform without authorization.

8. SYSTEM MAINTENANCE AND UPDATES
8.1. Scheduled Maintenance
- The system may undergo scheduled maintenance, during which access may be temporarily unavailable.
- You will be notified of planned maintenance activities when possible.

8.2. Updates and Changes
- The school reserves the right to modify, update, or discontinue features of the platform.
- You will be notified of significant changes that affect your use of the system.

9. LIABILITY AND DISCLAIMERS
9.1. System Availability
- The school does not guarantee uninterrupted or error-free operation of the platform.
- The school is not liable for any loss of data or system downtime.

9.2. Data Accuracy
- While the school strives to maintain accurate data, you are responsible for verifying critical information.
- The school is not liable for decisions made based on inaccurate data.

10. TERMINATION OF ACCESS
10.1. Violation of Terms
- Violation of these terms may result in immediate suspension or termination of your access.
- The school reserves the right to investigate any suspected violations.

10.2. End of Employment
- Your access to the platform will be terminated upon the end of your employment.
- You must return all school property and cease using the platform immediately.

11. PROFESSIONAL DEVELOPMENT
11.1. Training Requirements
- You may be required to complete training on platform usage and data privacy.
- You must stay current with platform updates and new features relevant to your role.

12. CONTACT INFORMATION
For questions or concerns regarding these Terms and Conditions, please contact:
- IT Department: it-support@southville.edu.ph
- School Administration: admin@southville.edu.ph
- Department Head: [Your Department Head Contact]

13. ACKNOWLEDGMENT
By using CampusConnect as a Teacher, you acknowledge that:
- You have read and understood these Terms and Conditions
- You agree to comply with all applicable laws and regulations
- You understand the consequences of violating these terms
- You will maintain the confidentiality and security of all student information you access
- You will use the platform in a professional manner consistent with your role as an educator

I agree to these Terms and Conditions.";

    public string CurrentTermsContent => SelectedRole == "Admin" ? AdminTermsContent : TeacherTermsContent;

    public Action<ViewModelBase>? NavigateBack { get; set; }

    partial void OnSelectedRoleChanged(string value)
    {
        OnPropertyChanged(nameof(CurrentTermsContent));
    }

    [RelayCommand]
    private void SelectAdmin()
    {
        SelectedRole = "Admin";
    }

    [RelayCommand]
    private void SelectTeacher()
    {
        SelectedRole = "Teacher";
    }

    [RelayCommand]
    private void GoBack()
    {
        if (NavigateBack == null) return;
        
        var loginVm = new LoginViewModel(
            ServiceLocator.Services.GetRequiredService<Services.IAuthService>(),
            ServiceLocator.Services.GetRequiredService<Services.IToastService>(),
            ServiceLocator.Services.GetRequiredService<Services.IRoleValidationService>(),
            ServiceLocator.Services.GetRequiredService<Services.IDialogService>()
        );
        loginVm.NavigateTo = (viewModel) => NavigateBack?.Invoke(viewModel);
        NavigateBack(loginVm);
    }
}

