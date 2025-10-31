import { TokenRegistration } from '@/app/api/tokens/register/route';
import TokenApproval from '@/emails/TokenApproval';
import TokenRegistrationAdmin from '@/emails/TokenRegistrationAdmin';
import TokenRegistrationUser from '@/emails/TokenRegistrationUser';
import { render } from '@react-email/components';

// Email template for user confirmation
export const createUserTokenRegistrationEmail = (tokenData: TokenRegistration) => {
  const subject = `Token Registration Submitted: ${tokenData.tokenName} (${tokenData.tokenSymbol})`;
  
  const html = render(
    TokenRegistrationUser({
      tokenName: tokenData.tokenName,
      tokenSymbol: tokenData.tokenSymbol,
      blockchain: tokenData.blockchain,
      contractAddress: tokenData.contractAddress,
      status: tokenData.status,
      registrationId: tokenData.id,
      createdAt: tokenData.createdAt,
    })
  );

  return { subject, html };
};

// Email template for admin notification
export const createAdminTokenRegistrationEmail = (tokenData: TokenRegistration) => {
  const subject = `New Token Registration: ${tokenData.tokenName} (${tokenData.tokenSymbol})`;
  
  const html = render(
    TokenRegistrationAdmin({
      tokenName: tokenData.tokenName,
      tokenSymbol: tokenData.tokenSymbol,
      blockchain: tokenData.blockchain,
      contractAddress: tokenData.contractAddress,
      submittedByAddress: tokenData.submittedByAddress,
      registrationId: tokenData.id,
      createdAt: tokenData.createdAt,
      website: tokenData.website,
      twitter: tokenData.twitter,
    })
  );

  return { subject, html };
};

// Email template for token approval notification
export const createTokenApprovalEmail = (tokenData: TokenRegistration, approved: boolean) => {
  const subject = `Token ${approved ? 'Approved' : 'Rejected'}: ${tokenData.tokenName} (${tokenData.tokenSymbol})`;
  
  const html = render(
    TokenApproval({
      tokenName: tokenData.tokenName,
      tokenSymbol: tokenData.tokenSymbol,
      blockchain: tokenData.blockchain,
      contractAddress: tokenData.contractAddress,
      approved,
    })
  );

  return { subject, html };
};
