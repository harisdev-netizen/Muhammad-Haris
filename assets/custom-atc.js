document.addEventListener('DOMContentLoaded', () => {
  const modals = document.querySelectorAll('.feature__product-popup');
  const overflow = document.querySelector('.feature__product-popup-overflow');
  const body = document.body;

  // Modal Logic
  const toggleModal = (modal, show) => {
    if (modal) modal.classList.toggle('hidden', !show);
    body.classList.toggle('overflow-hidden', show);
    if (overflow) overflow.classList.toggle('active', show);
  };

  const closeAll = () => {
    modals.forEach((m) => m.classList.add('hidden'));
    toggleModal(null, false);
    document
      .querySelectorAll('.custom-select-wrapper.active')
      .forEach((wrapper) => {
        wrapper.classList.remove('active');
      });
  };

  // Open Triggers (Icons & Images)
  document.querySelectorAll('.feature__product').forEach((product) => {
    const modal = product.querySelector('.feature__product-popup');
    const triggers = product.querySelectorAll(
      '.feature__product-plus-icon, .feature__product-image-wrapper',
    );

    triggers.forEach((trigger) => {
      if (trigger.classList.contains('feature__product-plus-icon'))
        trigger.style.pointerEvents = 'auto';

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModal(modal, true);
      });
    });
  });

  // Close Triggers (X buttons, Overflow, Escape key)
  document
    .querySelectorAll('.feature__product-popup-cross button')
    .forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAll();
      }),
    );
  overflow?.addEventListener('click', closeAll);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeAll());
  modals.forEach((m) =>
    m.addEventListener('click', (e) => e.stopPropagation()),
  );

  // Custom Select Dropdown Logic
  document.querySelectorAll('.custom-select-wrapper').forEach((wrapper) => {
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const valueDisplay = wrapper.querySelector('.custom-select-value');
    const options = wrapper.querySelectorAll('.custom-select-option');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.custom-select-wrapper').forEach((w) => {
        if (w !== wrapper) w.classList.remove('active');
      });
      wrapper.classList.toggle('active');
    });

    // Handle option selection
    options.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();

        options.forEach((opt) => opt.classList.remove('selected'));

        option.classList.add('selected');

        valueDisplay.textContent = option.dataset.value;

        hiddenInput.value = option.dataset.value;

        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));

        wrapper.classList.remove('active');
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      document
        .querySelectorAll('.custom-select-wrapper.active')
        .forEach((wrapper) => {
          wrapper.classList.remove('active');
        });
    }
  });

  // Add to Cart Logic
  document.querySelectorAll('.popup-form-atc').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('.add-to-cart-button');
      const btnText = btn.querySelector('span');
      const originalText = btnText.textContent;

      // Helper to manage UI state
      const setUIState = (loading, msg, isError = false) => {
        btn.disabled = loading;
        btnText.textContent = loading ? 'Adding...' : originalText;

        form.querySelector('.added-to-cart')?.remove();
        if (msg) {
          const p = document.createElement('p');
          p.className = 'added-to-cart';
          p.textContent = msg;
          p.style.color = isError ? 'red' : '';
          form.appendChild(p);
          if (!isError) setTimeout(() => p.remove(), 2000);
        }
      };

      setUIState(true);

      try {
        // Add item
        const addResponse = await fetch('/cart/add.js', {
          method: 'POST',
          body: new FormData(form),
        });
        if (!addResponse.ok) throw new Error('Failed to add');
        const addedItem = await addResponse.json();

        // Get updated count
        const cartData = await (await fetch('/cart.json')).json();

        // Update Cart Bubbles (Combined selector)
        const countSelectors =
          '.cart-count-bubble span, #cart-icon-bubble span, [data-cart-count], .header__icon--cart .icon__fallback-text';
        document
          .querySelectorAll(countSelectors)
          .forEach((el) => (el.textContent = cartData.item_count));

        // Open Drawer (Try standard element first, then classes)
        const drawer = document.querySelector('cart-drawer');
        if (drawer?.open) drawer.open();
        else
          document
            .querySelector('#cart-drawer, .cart-drawer, [data-cart-drawer]')
            ?.classList.add('active', 'open');

        // Dispatch Events for Theme Compatibility
        document.dispatchEvent(
          new CustomEvent('cart:updated', {
            detail: { cart: cartData, item: addedItem },
          }),
        );
        if (window.Shopify?.theme) {
          document.dispatchEvent(
            new CustomEvent('product:added-to-cart', {
              detail: {
                variant_id: addedItem.variant_id,
                quantity: addedItem.quantity,
              },
            }),
          );
        }

        setUIState(false, 'Added to cart!');
        setTimeout(closeAll, 1200);
      } catch (err) {
        console.error(err);
        setUIState(false, 'Error adding to cart. Try again.', true);
      }
    });
  });
});
