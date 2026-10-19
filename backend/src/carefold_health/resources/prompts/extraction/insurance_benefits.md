Extract structured health insurance benefits data from the provided document text into the InsuranceBenefitsDossier schema:
- copays (in-network and out-of-network copayment amounts)
- deductibles (individual and family annual deductibles)
- coinsurance (percentage cost-sharing requirements)
- in_out_network_rules (restrictions, referral requirements)
- prior_authorization_flags (procedures requiring pre-authorization)

Extract only facts and numbers explicitly stated in the document. Do not extrapolate or guess.
