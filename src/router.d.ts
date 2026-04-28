import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** When true, the route component is preserved in memory across navigations */
    keepAlive?: boolean
  }
}
