<template>
  <form class="p-6 md:p-8">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col items-center text-center">
        <h1 class="text-2xl font-bold">Welcome back</h1>
        <p class="text-balance text-muted-foreground">Login to your account</p>
      </div>
      <div class="grid gap-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          autocomplete="email"
          v-model="user.email"
        />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center">
          <Label for="password">Password</Label>
          <a href="" class="ml-auto text-sm underline-offset-2 hover:underline">
            Forgot your password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          required
          autocomplete="current-password"
          v-model="user.password"
        />
      </div>
      <Button type="submit" class="w-full" @click.prevent="handleClickLogin">
        <i-lucide-loader v-if="isLoading" class="animate-spin" />
        Login
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits<{
  login: [values: {}];
}>();

const user = reactive({
  email: "demo",
  password: "demo",
});

const handleClickLogin = () => {
  emit("login", user);
};
</script>
