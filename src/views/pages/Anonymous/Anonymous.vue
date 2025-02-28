<template>
  <div
    class="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10"
  >
    <div class="w-full max-w-sm md:max-w-3xl">
      <div class="flex flex-col gap-6">
        <Card class="overflow-hidden">
          <CardContent class="grid p-0 md:grid-cols-2">
            <AnonymousForm :is-loading @login="handleUserLogin" />
            <div class="relative hidden bg-muted md:block">
              <img
                src="/placeholder.svg"
                alt="Image"
                class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useLogin } from "@/services/api/auth/useLogin";
import { Auth } from "@/services/auth/auth.service";

const { execute, onResultError, onResultSuccess, result, isLoading } =
  useLogin();

const auth = new Auth();
const router = useRouter();

const handleUserLogin = (user: any) => {
  //just a demo for now

  if (user.email === "demo" && user.password === "demo") {
    auth.setAuthData({
      id: 1,
      email: user.name,
      name: user.name,
    });

    router.push({ name: "Home" });
  }
};
onResultSuccess(() => {
  console.log(result);
});

onResultError((err) => {
  console.log(err);
});
</script>
