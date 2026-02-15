// services/profileGateService.js
exports.checkProfileCompletion = (employee) => {
  const missing = [];

  // minimum KYC
  if (!employee?.documents?.aadharCard) missing.push('Aadhar Card');
  if (!employee?.bankDetails?.accountNo || !employee?.bankDetails?.ifsc) missing.push('Bank Details');

  // job assignment
  if (!employee?.department) missing.push('Department');
  if (!employee?.jobProfile) missing.push('Job Profile');

  const requiredCount = 4;
  const done = requiredCount - missing.length;
  const completionPercent = Math.round((done / requiredCount) * 100);

  return {
    isComplete: missing.length === 0,
    missing,
    completionPercent
  };
};
 