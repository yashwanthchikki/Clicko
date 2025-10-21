const DOMAIN = "";

async function signIn(username, password) {
  const res = await fetch(`${DOMAIN}/authservice/signin`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signin failed");
  return data;
}

async function signUp(username, password) {
  const res = await fetch(`${DOMAIN}/authservice/signup`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: "include"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
}
