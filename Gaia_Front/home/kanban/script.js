(function(){
                const userBtn = document.getElementById('userBtn');
                const sidebar = document.getElementById('sidebar');
                const closeBtn = document.getElementById('closeSidebar');

                if(!userBtn || !sidebar) return;

                function openSidebar(){
                    sidebar.classList.add('open');
                    sidebar.setAttribute('aria-hidden','false');
                }

                function closeSidebarFunc(){
                    sidebar.classList.remove('open');
                    sidebar.setAttribute('aria-hidden','true');
                }

                userBtn.addEventListener('click', function(e){
                    e.stopPropagation();
                    if(sidebar.classList.contains('open')) closeSidebarFunc();
                    else openSidebar();
                });

                if(closeBtn) closeBtn.addEventListener('click', closeSidebarFunc);

        
                document.addEventListener('click', function(e){
                    if(!sidebar.classList.contains('open')) return;
                    if(!sidebar.contains(e.target) && e.target !== userBtn && !userBtn.contains(e.target)){
                        closeSidebarFunc();
                    }
                });

          
                document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSidebarFunc(); });
            })();