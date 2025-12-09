import { JobApplicants } from "@/components/alumni/JobApplicants";

const ApplicationsOverview = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <JobApplicants
        backPath="/admin/postings"
        detailsPath="/alumni/applicant-details"
        heading="Applications Overview"
      />
    </div>
  );
};

export default ApplicationsOverview;
