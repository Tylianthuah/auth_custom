import { checkAuth, logOut } from '@/auth/nextjs/actions';
import { getCurrentUser } from '@/auth/nextjs/currentUser'
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import React from 'react'

const Home = async () => {
  let isAuthenticated = await checkAuth();
  if(!isAuthenticated) redirect("/sign-in")
  let user = await getCurrentUser();
  return (
    <div>Home

      <Button variant="default" onClick={async () => {
        await logOut();
      }}>
        Logout
      </Button>
    </div>
  )
}

export default Home