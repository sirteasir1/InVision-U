import { NextRequest } from 'next/server'

export function isCommitteeAuthorized(req: NextRequest): boolean {
  const pw = req.headers.get('x-committee-password')
  return pw === process.env.COMMITTEE_PASSWORD
}
