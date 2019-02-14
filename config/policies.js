/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  'dashboard/view-welcome': 'is-logged-in',
  'account/update-billing-card': 'is-logged-in',
  'account/update-password': 'is-logged-in',
  'account/update-profile': 'is-logged-in',
  'account/view-account-overview': 'is-logged-in',
  'account/view-edit-password': 'is-logged-in',
  'account/view-edit-profile': 'is-logged-in',
  
  'SMSController': {
    'callback': 'phone-is-authorize',
    'callbackV2': 'phone-is-authorize-v2'
  },

  // Bypass the `is-logged-in` policy for:
  // 'entrance/*': true,
  // 'account/logout': true,
  // 'view-homepage-or-redirect': true,
  // 'deliver-contact-form-message': true,

};
