"""Tests for tools/job_filters.py - the client-side experience/seniority filter.

freehire has no years-of-experience facet and its seniority enrichment is sparse
and sometimes wrong, so the pipeline decides "0-2 years only" from the posting
text. These pin the cases that matter: real 3+ year requirements are rejected,
fresher-friendly and unstated ones are kept, and company marketing copy or
decimals never cause a false reject.
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
from job_filters import city_rank, experience_verdict, years_required  # noqa: E402


class YearsRequired(unittest.TestCase):
    def test_plus_form(self):
        self.assertEqual(years_required("Requires 3+ years of experience in Python"), (3, 3))

    def test_range_forms(self):
        self.assertEqual(years_required("0-2 years of experience"), (0, 2))
        self.assertEqual(years_required("Experience: 2 to 4 years"), (2, 4))
        self.assertEqual(years_required("1 - 3 yrs experience"), (1, 3))

    def test_minimum_and_at_least(self):
        self.assertEqual(years_required("Minimum 5 years in ML engineering"), (5, 5))
        self.assertEqual(years_required("At least 4 years building models"), (4, 4))

    def test_highest_floor_wins(self):
        self.assertEqual(years_required("2+ years of experience with SQL. 5+ years of experience overall."), (5, 5))

    def test_unstated_is_none(self):
        self.assertIsNone(years_required("Build LLM agents. Strong Python skills."))
        self.assertIsNone(years_required(""))
        self.assertIsNone(years_required(None))

    def test_company_copy_is_not_a_requirement(self):
        self.assertIsNone(years_required("Our company has 15 years of experience in fintech."))
        self.assertIsNone(years_required("Since 2008, with 17 years of experience serving banks."))

    def test_we_require_is_a_requirement(self):
        self.assertEqual(years_required("We require 4+ years of experience."), (4, 4))

    def test_decimal_is_not_split_into_a_new_sentence(self):
        # "3.5 years" must not read as a separate "5 years" mention
        self.assertEqual(years_required("Experience of 1.5 years is a plus"), None)

    def test_year_numbers_are_not_experience(self):
        self.assertIsNone(years_required("Experience with models released 2020-2023"))


class Verdict(unittest.TestCase):
    def test_reject_three_plus(self):
        self.assertEqual(experience_verdict("3+ years of experience")[0], "reject")

    def test_fresher_ranges_pass(self):
        self.assertEqual(experience_verdict("0-2 years of experience")[0], "ok")
        self.assertEqual(experience_verdict("1-3 years of experience")[0], "ok")

    def test_two_to_four_is_a_stretch_not_a_reject(self):
        verdict, why = experience_verdict("2-4 years of experience")
        self.assertEqual(verdict, "stretch")
        self.assertIn("2-4", why)

    def test_unstated_is_kept(self):
        self.assertEqual(experience_verdict("Build LLM agents.")[0], "ok")
        self.assertEqual(experience_verdict(None)[0], "ok")

    def test_senior_enrichment_rejects_even_without_years(self):
        for level in ("senior", "lead", "staff", "principal", "c_level", "Senior"):
            self.assertEqual(experience_verdict("Build LLM agents.", level)[0], "reject", level)

    def test_junior_enrichment_does_not_override_stated_years(self):
        # enrichment tagged a "Senior AI Engineer" as junior; the text still decides
        self.assertEqual(experience_verdict("5+ years of experience", "junior")[0], "reject")


class CityRank(unittest.TestCase):
    PRIORITY = ["bengaluru|bangalore", "hyderabad", "pune", "gurugram|gurgaon"]

    def test_bangalore_first_with_aliases(self):
        self.assertEqual(city_rank("Bengaluru, in", self.PRIORITY), 0)
        self.assertEqual(city_rank("Bangalore, Karnataka", self.PRIORITY), 0)

    def test_order_follows_priority(self):
        self.assertLess(city_rank("Hyderabad", self.PRIORITY), city_rank("Pune", self.PRIORITY))
        self.assertEqual(city_rank("Gurgaon", self.PRIORITY), 3)

    def test_unlisted_or_missing_sorts_last(self):
        self.assertEqual(city_rank("Mumbai", self.PRIORITY), 4)
        self.assertEqual(city_rank(None, self.PRIORITY), 4)
        self.assertEqual(city_rank("Anywhere", []), 0)


if __name__ == "__main__":
    unittest.main()
