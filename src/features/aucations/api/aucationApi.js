import apiHelper from "../../../helpers/apiHelper";

const aucationApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/aucations`;

  function _url(path) {
    return BASE_URL + path;
  }

  async function _parse(response, fallbackMessage) {
    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  // GET /aucations?is_me=1&is_closed=0|1
  async function getAucations({ isMe = false, isClosed = "" } = {}) {
    const params = new URLSearchParams();
    if (isMe) params.append("is_me", "1");
    if (isClosed !== "" && isClosed !== null && isClosed !== undefined) {
      params.append("is_closed", String(isClosed));
    }

    const query = params.toString();
    const response = await apiHelper.fetchData(_url(query ? `/?${query}` : "/"), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil data lelang");
    return result.data?.aucations || [];
  }

  // GET /aucations/:id
  async function getAucationById(aucationId) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}`), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil detail lelang");
    return result.data?.aucation;
  }

  // POST /aucations
  async function postAucation(title, description, startBid, closedAt) {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        start_bid: Number(startBid),
        closed_at: closedAt,
      }),
    });

    const result = await _parse(response, "Gagal menambahkan lelang");
    return result.data;
  }

  // PUT /aucations/:id
  async function putAucation(aucationId, title, description, startBid, closedAt) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        start_bid: Number(startBid),
        closed_at: closedAt,
      }),
    });

    const result = await _parse(response, "Gagal mengubah lelang");
    return result.message;
  }

  // POST /aucations/:id/cover (multipart/form-data)
  async function postAucationCover(aucationId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const response = await apiHelper.fetchData(_url(`/${aucationId}/cover`), {
      method: "POST",
      body: formData,
    });

    const result = await _parse(response, "Gagal mengubah cover");
    return result.message;
  }

  // DELETE /aucations/:id
  async function deleteAucation(aucationId) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus lelang");
    return result.message;
  }

  // POST /aucations/:id/bids  { bid: number }
  async function postBid(aucationId, bid) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}/bids`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bid: Number(bid) }),
    });

    const result = await _parse(response, "Gagal mengajukan penawaran");
    return result.message;
  }

  // DELETE /aucations/:id/bids
  async function deleteBid(aucationId) {
    const response = await apiHelper.fetchData(_url(`/${aucationId}/bids`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus penawaran");
    return result.message;
  }

  // DELETE /aucations (hapus seluruh lelang milik pengguna)
  async function deleteAllAucations() {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus semua lelang");
    return result.message;
  }

  return {
    getAucations,
    getAucationById,
    postAucation,
    putAucation,
    postAucationCover,
    deleteAucation,
    postBid,
    deleteBid,
    deleteAllAucations,
  };
})();

export default aucationApi;
