/**
 * Shared type definitions used across the app.
 * Plain JSDoc typedefs - no TS compilation needed in this Vite project.
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {import('../constants/roles').ROLES[keyof import('../constants/roles').ROLES]} role
 * @property {string=} avatar
 * @property {string=} department
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {AuthUser} user
 * @property {number} expiresIn
 */

/**
 * @typedef {Object} NavMenuItem
 * @property {string} label
 * @property {string} path
 * @property {import('lucide-react').LucideIcon} icon
 * @property {import('../constants/roles').ROLES[]=} roles
 * @property {NavMenuItem[]=} children
 */

/**
 * @typedef {Object} ToastMessage
 * @property {string} id
 * @property {'success'|'error'|'info'|'warning'} type
 * @property {string} title
 * @property {string=} description
 */

export {};
