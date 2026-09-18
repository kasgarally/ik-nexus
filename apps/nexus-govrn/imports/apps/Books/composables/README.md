<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Vue composables for this sub-app
-->
# Composables

`use…` helpers for Books screens (subscribe + observe a book, derive a risk score). Keep `meteor/*` here if the composable talks to Minimongo. Cross-app composables (`useOwnerFiles`, `useListItems`) stay in `@nexus/ui`.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- Reactive queries and derived state used by more than one view
- Not DDP methods (those live on the collection file)
