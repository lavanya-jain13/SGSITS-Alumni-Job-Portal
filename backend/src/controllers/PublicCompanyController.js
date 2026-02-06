const db = require("../config/db");

const getCompanyByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await db("companies")
      .select(
        "id",
        "name",
        "industry",
        "about",
        "company_culture",
        "company_size",
        "founded_year",
        "office_location",
        "website",
        "linkedin",
        "twitter",
        "status"
      )
      .where({ id })
      .first();

    // Company must exist AND be approved
    if (!company || company.status !== "approved") {
      return res.status(404).json({
        error: "Company not found",
      });
    }

    return res.json({
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        about: company.about,
        company_culture: company.company_culture,
        company_size: company.company_size,
        founded_year: company.founded_year,
        office_location: company.office_location,
        website: company.website,
        linkedin: company.linkedin,
        twitter: company.twitter,

        // derived field for UI
        is_verified: true,
      },
    });
  } catch (error) {
    console.error("PublicCompanyController Error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = {
  getCompanyByIdPublic,
};
