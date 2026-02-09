import { redirect } from 'next/navigation';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
    // Redirect to the insights tab by default
    redirect(`/dashboard/${params.projectId}/insights`);
}
