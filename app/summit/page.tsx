import { redirect } from 'next/navigation'

// /summit — tracking route for Summit at Sea conference attendees.
// Redirects to the landing page with UTM parameters attached for attribution.
export default function SummitRedirect() {
  redirect('/?utm_source=summit_at_sea&utm_medium=conference&utm_campaign=summit_2026')
}
