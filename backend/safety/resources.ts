import { api } from "encore.dev/api";

export interface SafetyResource {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  externalLinks?: { title: string; url: string }[];
  iconName: string;
}

const SAFETY_RESOURCES: SafetyResource[] = [
  {
    id: "before-appointment",
    title: "Before Your Appointment",
    description: "Tips for staying safe before meeting a stylist or client",
    category: "preparation",
    iconName: "ClipboardCheck",
    content: `
## Check the Profile
- Review the stylist's or client's profile thoroughly
- Look at their ratings and reviews from other users
- Check that they are "Braida Verified" if possible

## Share Your Plans
- Tell a trusted friend or family member about your appointment
- Share the stylist's name, location, and appointment time
- Use Braida's "Share Booking" feature to send details to a contact

## Confirm Details
- Verify the appointment time and location
- For mobile services, confirm the exact address
- Save the stylist's contact information

## Trust Your Instincts
- If something feels off, it's okay to cancel
- Rescheduling is always an option
- Your safety comes first
    `,
    externalLinks: [
      { title: "UK Government Safety Advice", url: "https://www.gov.uk/personal-safety-advice" },
    ],
  },
  {
    id: "during-appointment",
    title: "During Your Appointment",
    description: "How to stay safe during your service",
    category: "active",
    iconName: "Shield",
    content: `
## Stay Connected
- Keep your phone charged and accessible
- Let someone know when your appointment starts
- Check in with your trusted contact during long appointments

## Know Your Location
- Be aware of exits if at an unfamiliar location
- For mobile services, choose a comfortable space in your home
- Meet in common areas for new stylists if you prefer

## Communicate Clearly
- Express any discomfort or concerns immediately
- You can pause or stop the service at any time
- Professional stylists respect boundaries

## Document Your Experience
- It's okay to take photos of your style throughout
- Note the time the service starts and ends
- Save receipts and payment confirmations

## If You Feel Unsafe
- Use the "Safety/Help" button in the Braida app
- Call emergency services (999) if in immediate danger
- Leave the situation if possible
    `,
    externalLinks: [],
  },
  {
    id: "for-freelancers",
    title: "Safety Tips for Stylists",
    description: "Guidelines for freelancers providing services",
    category: "freelancer",
    iconName: "UserShield",
    content: `
## Client Verification
- Use Braida's client verification features
- Review client profiles and booking history
- Be cautious with new or unverified clients

## Mobile Service Safety
- Share your schedule with someone you trust
- Research the area before traveling
- Consider bringing a companion for first appointments

## Your Workspace
- Ensure your studio is well-lit and secure
- Have a clear exit route
- Keep emergency contacts easily accessible

## Payment Safety
- Always use Braida's secure payment system
- Never accept large cash payments
- Report suspicious payment requests

## Setting Boundaries
- Clearly communicate your policies
- It's okay to decline uncomfortable requests
- Document and report inappropriate behavior
    `,
    externalLinks: [
      { title: "Self-Employed Workers Rights", url: "https://www.gov.uk/self-employed-records" },
    ],
  },
  {
    id: "reporting-issues",
    title: "Reporting Safety Issues",
    description: "How to report problems and get help",
    category: "help",
    iconName: "AlertTriangle",
    content: `
## In-App Reporting
- Use the "Report" button on any profile or booking
- Describe the issue in detail
- Include any evidence (screenshots, messages)

## Dispute Resolution
- Open a dispute within 48 hours of an incident
- Braida support will review and mediate
- Keep all communication through the app

## Emergency Situations
- Call 999 for immediate emergencies
- Use Braida's emergency alert feature
- Contact Braida support after you're safe

## What Happens After Reporting
- All reports are reviewed within 24 hours
- You'll receive updates on the investigation
- Serious violations result in immediate account suspension

## Confidentiality
- Your reports are kept confidential
- We never share your details with the reported party
- You can report anonymously in some cases
    `,
    externalLinks: [
      { title: "Citizens Advice", url: "https://www.citizensadvice.org.uk/" },
    ],
  },
  {
    id: "privacy-protection",
    title: "Protecting Your Privacy",
    description: "Keep your personal information secure",
    category: "privacy",
    iconName: "Lock",
    content: `
## Personal Information
- Never share your home address until booking is confirmed
- Use Braida messaging instead of personal phone numbers
- Be cautious about sharing social media profiles

## Payment Security
- Never share bank details outside the app
- Use only Braida's secure payment system
- Report requests for alternative payment methods

## Photos and Portfolio
- Only share photos you're comfortable making public
- Remove identifying backgrounds from portfolio images
- You control what's visible on your profile

## Account Security
- Use a strong, unique password
- Enable two-factor authentication
- Log out from shared devices
    `,
    externalLinks: [
      { title: "National Cyber Security Centre", url: "https://www.ncsc.gov.uk/" },
    ],
  },
];

export const getSafetyResources = api(
  { method: "GET", path: "/safety/resources", expose: true },
  async (): Promise<{ resources: SafetyResource[] }> => {
    return { resources: SAFETY_RESOURCES };
  }
);

export const getSafetyResource = api(
  { method: "GET", path: "/safety/resources/:id", expose: true },
  async (req: { id: string }): Promise<SafetyResource> => {
    const resource = SAFETY_RESOURCES.find((r) => r.id === req.id);
    if (!resource) {
      throw new Error("Resource not found");
    }
    return resource;
  }
);

