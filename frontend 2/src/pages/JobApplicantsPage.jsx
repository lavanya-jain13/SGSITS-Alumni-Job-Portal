import { JobApplicants } from "@/components/alumni/JobApplicants";

const JobApplicantsPage = () => {
  return (
    <JobApplicants
      heading="Applications Overview"
      backPath="/alumni"
      detailsPath="/alumni/applicant-details"
      contextText="Live applications for your postings"
    />
  );
};

export default JobApplicantsPage;
