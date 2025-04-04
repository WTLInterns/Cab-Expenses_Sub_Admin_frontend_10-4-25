// import { NextResponse } from 'next/server';
// import { parseCookies } from 'nookies';

// export function middleware(req) {
//   // Parse the cookies from the request
//   const cookies = parseCookies({ req });

//   // Get the token from the cookies
//   const token = cookies.token;

//   // Define the list of protected routes
//   const protectedRoutes = [
//     '/AdminDashboard',
//     '/DriverDetails',
//     '/CabInfo',
//     '/Servicing',
//     '/Expensive',
//     '/AssignCab',
//   ];

//   // If the user tries to access a protected route and doesn't have a token
//   if (protectedRoutes.some((route) => req.url.includes(route)) && !token) {
//     // Redirect to the login page if not logged in
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   // Allow the request to continue if the token exists
//   return NextResponse.next();
// }

// export const config = {
//   // Apply the middleware only to protected routes
//   matcher: ['/AdminDashboard', '/DriverDetails', '/CabInfo', '/Servicing', '/Expensive', '/AssignCab'],
// };
