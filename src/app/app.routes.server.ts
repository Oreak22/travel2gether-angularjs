import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/admin/packages/:id/edit',
    renderMode: RenderMode.Server, 
  },
  {
    path: 'packages/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [{ id: 'alpine-retreat' }, { id: 'coastal-escape' }],
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
